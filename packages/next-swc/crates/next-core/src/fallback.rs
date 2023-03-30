use std::collections::HashMap;

use anyhow::{bail, Result};
use turbo_binding::turbo::tasks_env::ProcessEnvVc;
use turbo_binding::turbo::tasks_fs::FileSystemPathVc;
use turbo_binding::turbopack::core::{
    chunk::ChunkGroupVc,
    compile_time_info::CompileTimeInfoVc,
    context::AssetContextVc,
    resolve::{options::ImportMap, origin::PlainResolveOriginVc},
};
use turbo_binding::turbopack::dev_server::html::DevHtmlAssetVc;
use turbo_binding::turbopack::node::execution_context::ExecutionContextVc;
use turbo_binding::turbopack::turbopack::{
    ecmascript::EcmascriptModuleAssetVc, transition::TransitionsByNameVc, ModuleAssetContextVc,
};
use turbo_tasks::Value;

use crate::{
    next_client::context::{
        get_client_chunking_context, get_client_module_options_context,
        get_client_resolve_options_context, get_client_runtime_entries, ClientContextType,
    },
    next_config::NextConfigVc,
    next_import_map::{insert_alias_option, insert_next_shared_aliases},
    runtime::resolve_runtime_request,
};

#[turbo_tasks::function]
pub async fn get_fallback_page(
    project_path: FileSystemPathVc,
    execution_context: ExecutionContextVc,
    dev_server_root: FileSystemPathVc,
    env: ProcessEnvVc,
    client_compile_time_info: CompileTimeInfoVc,
    next_config: NextConfigVc,
) -> Result<DevHtmlAssetVc> {
    let ty = Value::new(ClientContextType::Fallback);
    let resolve_options_context =
        get_client_resolve_options_context(project_path, ty, next_config, execution_context);
    let module_options_context = get_client_module_options_context(
        project_path,
        execution_context,
        client_compile_time_info.environment(),
        ty,
        next_config,
    );
    let chunking_context = get_client_chunking_context(
        project_path,
        dev_server_root,
        client_compile_time_info.environment(),
        ty,
    );
    let entries = get_client_runtime_entries(project_path, env, ty, next_config, execution_context);

    let mut import_map = ImportMap::empty();
    insert_next_shared_aliases(&mut import_map, project_path, execution_context).await?;
    insert_alias_option(
        &mut import_map,
        project_path,
        next_config.resolve_alias_options(),
        ["browser"],
    )
    .await?;

    let context: AssetContextVc = ModuleAssetContextVc::new(
        TransitionsByNameVc::cell(HashMap::new()),
        client_compile_time_info,
        module_options_context,
        resolve_options_context.with_extended_import_map(import_map.cell()),
    )
    .into();

    let runtime_entries = entries.resolve_entries(context);

    let fallback_chunk = resolve_runtime_request(
        PlainResolveOriginVc::new(context, project_path).into(),
        "entry/fallback",
    );

    let module = if let Some(module) =
        EcmascriptModuleAssetVc::resolve_from(fallback_chunk.as_asset()).await?
    {
        module
    } else {
        bail!("fallback runtime entry is not an ecmascript module");
    };

    let chunk = module.as_evaluated_chunk(chunking_context, Some(runtime_entries));

    Ok(DevHtmlAssetVc::new(
        dev_server_root.join("fallback.html"),
        vec![ChunkGroupVc::from_chunk(chunk)],
    ))
}
