extern crate napi_build;

fn main() {
    // Generates, stores build-time information as static values.
    // There are some places relying on correct values for this (i.e telemetry),
    // So failing build if this fails.
    shadow_rs::new().expect("Should able to generate build time information");

    #[cfg(not(all(target_os = "macos", target_arch = "aarch64")))]
    napi_build::setup();

    // This is a workaround for napi always including a GCC specific flag.
    #[cfg(all(target_os = "macos", target_arch = "aarch64"))]
    {
        println!("cargo:rerun-if-env-changed=DEBUG_GENERATED_CODE");
        println!("cargo:rerun-if-env-changed=TYPE_DEF_TMP_PATH");
        println!("cargo:rerun-if-env-changed=CARGO_CFG_NAPI_RS_CLI_VERSION");

        println!("cargo:rustc-cdylib-link-arg=-undefined");
        println!("cargo:rustc-cdylib-link-arg=dynamic_lookup");
    }

    // Resolve a potential linker issue for unit tests on linux
    // https://github.com/napi-rs/napi-rs/issues/1782
    #[cfg(all(target_os = "linux", not(target_arch = "wasm32")))]
    println!("cargo:rustc-link-arg=-Wl,--warn-unresolved-symbols");

    #[cfg(not(target_arch = "wasm32"))]
    turbopack_binding::turbo::tasks_build::generate_register();
}
