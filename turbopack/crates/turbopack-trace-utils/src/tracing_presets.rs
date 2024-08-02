use once_cell::sync::Lazy;

pub static TRACING_OVERVIEW_TARGETS: Lazy<Vec<&str>> = Lazy::new(|| {
    vec![
        "turbo_tasks=info",
        "turbo_tasks_fs=info",
        "turbopack=info",
        "turbopack_binding=info",
        "turbopack_nodejs=info",
        "turbopack_cli=info",
        "turbopack_cli_utils=info",
        "turbopack_core=info",
        "turbopack_css=info",
        "turbopack_browser=info",
        "turbopack_dev_server=info",
        "turbopack_ecmascript=info",
        "turbopack_ecmascript_hmr_protocol=info",
        "turbopack_ecmascript_plugins=info",
        "turbopack_ecmascript_runtime=info",
        "turbopack_env=info",
        "turbopack_image=info",
        "turbopack_json=info",
        "turbopack_mdx=info",
        "turbopack_node=info",
        "turbopack_static=info",
        "turbopack_swc_utils=info",
        "turbopack_wasm=info",
    ]
});
pub static TRACING_TURBOPACK_TARGETS: Lazy<Vec<&str>> = Lazy::new(|| {
    [
        &TRACING_OVERVIEW_TARGETS[..],
        &[
            "turbopack=trace",
            "turbopack_binding=trace",
            "turbopack_nodejs=trace",
            "turbopack_cli=trace",
            "turbopack_cli_utils=trace",
            "turbopack_core=trace",
            "turbopack_css=trace",
            "turbopack_browser=trace",
            "turbopack_dev_server=trace",
            "turbopack_ecmascript=trace",
            "turbopack_ecmascript_hmr_protocol=trace",
            "turbopack_ecmascript_plugins=trace",
            "turbopack_ecmascript_runtime=trace",
            "turbopack_env=trace",
            "turbopack_image=trace",
            "turbopack_json=trace",
            "turbopack_mdx=trace",
            "turbopack_node=trace",
            "turbopack_static=trace",
            "turbopack_swc_utils=trace",
            "turbopack_wasm=trace",
        ],
    ]
    .concat()
});
pub static TRACING_TURBO_TASKS_TARGETS: Lazy<Vec<&str>> = Lazy::new(|| {
    [
        &TRACING_TURBOPACK_TARGETS[..],
        &[
            "turbo_tasks=trace",
            "turbo_tasks_auto_hash_map=trace",
            "turbo_tasks_build=trace",
            "turbo_tasks_bytes=trace",
            "turbo_tasks_env=trace",
            "turbo_tasks_fetch=trace",
            "turbo_tasks_fs=trace",
            "turbo_tasks_hash=trace",
            "turbo_tasks_memory=trace",
        ],
    ]
    .concat()
});
