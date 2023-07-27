use std::io::Write;

use anyhow::{bail, Result};
use turbo_tasks::{TryJoinIterExt, Value, ValueToString, Vc};
use turbopack_binding::{
    turbo::tasks_fs::{rope::RopeBuilder, File, FileSystemPath},
    turbopack::{
        core::{
            asset::AssetContent, context::AssetContext, issue::IssueExt, module::Module,
            reference_type::ReferenceType, virtual_source::VirtualSource,
        },
        ecmascript::{chunk::EcmascriptChunkPlaceable, utils::StringifyJs},
        turbopack::ModuleAssetContext,
    },
};

use super::app_entry::AppEntry;
use crate::{
    app_structure::LoaderTree,
    loader_tree::{LoaderTreeModule, ServerComponentTransition},
    mode::NextMode,
    next_app::UnsupportedDynamicMetadataIssue,
    next_server_component::NextServerComponentTransition,
    parse_segment_config_from_loader_tree,
    util::{load_next_js, resolve_next_module, NextRuntime},
};

/// Computes the entry for a Next.js app page.
#[turbo_tasks::function]
pub async fn get_app_page_entry(
    nodejs_context: Vc<ModuleAssetContext>,
    edge_context: Vc<ModuleAssetContext>,
    loader_tree: Vc<LoaderTree>,
    app_dir: Vc<FileSystemPath>,
    pathname: String,
    project_root: Vc<FileSystemPath>,
) -> Result<Vc<AppEntry>> {
    let config = parse_segment_config_from_loader_tree(loader_tree, Vc::upcast(nodejs_context));
    let context = if matches!(config.await?.runtime, Some(NextRuntime::Edge)) {
        edge_context
    } else {
        nodejs_context
    };

    let server_component_transition = Vc::upcast(NextServerComponentTransition::new());

    let loader_tree = LoaderTreeModule::build(
        loader_tree,
        context,
        ServerComponentTransition::Transition(server_component_transition),
        NextMode::Build,
    )
    .await?;

    let LoaderTreeModule {
        inner_assets,
        imports,
        loader_tree_code,
        unsupported_metadata,
        pages,
    } = loader_tree;

    if !unsupported_metadata.is_empty() {
        UnsupportedDynamicMetadataIssue {
            app_dir,
            files: unsupported_metadata,
        }
        .cell()
        .emit();
    }

    let mut result = RopeBuilder::default();

    for import in imports {
        writeln!(result, "{import}")?;
    }

    let pages = pages.iter().map(|page| page.to_string()).try_join().await?;

    let original_name = get_original_page_name(&pathname);

    let template_file = "/dist/esm/build/webpack/loaders/next-route-loader/entries/app-page.js";

    // Load the file from the next.js codebase.
    let file = load_next_js(project_root, template_file).await?.await?;

    let mut file = file
        .to_str()?
        .replace(
            "\"VAR_DEFINITION_PAGE\"",
            &StringifyJs(&original_name).to_string(),
        )
        .replace(
            "\"VAR_DEFINITION_PATHNAME\"",
            &StringifyJs(&pathname).to_string(),
        )
        .replace(
            "\"VAR_ORIGINAL_PATHNAME\"",
            &StringifyJs(&original_name).to_string(),
        )
        // TODO(alexkirsz) Support custom global error.
        .replace(
            "\"VAR_MODULE_GLOBAL_ERROR\"",
            &StringifyJs("next/dist/client/components/error-boundary").to_string(),
        )
        .replace(
            "// INJECT:tree",
            format!("const tree = {};", loader_tree_code).as_str(),
        )
        .replace(
            "// INJECT:pages",
            format!("const pages = {};", StringifyJs(&pages)).as_str(),
        )
        .replace(
            "// INJECT:__next_app_require__",
            "const __next_app_require__ = __turbopack_require__",
        )
        .replace(
            "// INJECT:__next_app_load_chunk__",
            "const __next_app_load_chunk__ = __turbopack_load__",
        );

    // Ensure that the last line is a newline.
    if !file.ends_with('\n') {
        file.push('\n');
    }

    result.concat(&RopeBuilder::from(file.as_bytes().to_vec()).build());

    let file = File::from(result.build());

    let resolve_result = resolve_next_module(project_root, template_file).await?;

    let Some(template_path) = *resolve_result.first_module().await? else {
        bail!("Expected to find module");
    };

    let template_path = template_path.ident().path();

    let source = VirtualSource::new(template_path, AssetContent::file(file.into()));

    let rsc_entry = context.process(
        Vc::upcast(source),
        Value::new(ReferenceType::Internal(Vc::cell(inner_assets))),
    );

    let Some(rsc_entry) =
        Vc::try_resolve_sidecast::<Box<dyn EcmascriptChunkPlaceable>>(rsc_entry).await?
    else {
        bail!("expected an ECMAScript chunk placeable asset");
    };

    Ok(AppEntry {
        pathname: pathname.to_string(),
        original_name,
        rsc_entry,
        config,
    }
    .cell())
}

// TODO(alexkirsz) This shouldn't be necessary. The loader tree should keep
// track of this instead.
fn get_original_page_name(pathname: &str) -> String {
    match pathname {
        "/" => "/page".to_string(),
        "/_not-found" => "/_not-found".to_string(),
        _ => format!("{}/page", pathname),
    }
}
