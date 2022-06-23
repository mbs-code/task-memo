#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri_plugin_sql::TauriSql;

fn main() {
    let context = tauri::generate_context!();
    tauri::Builder::default()
        .plugin(TauriSql::default())
        .menu(tauri::Menu::os_default(&context.package_info().name))
        .run(context)
        .expect("error while running tauri application");
}
