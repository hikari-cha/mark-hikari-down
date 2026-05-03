use serde::Serialize;
use std::fs;

#[derive(Serialize)]
struct InitialFile {
    path: String,
    content: String,
}

#[tauri::command]
fn open_initial_file() -> Option<InitialFile> {
    let path = std::env::args().nth(1)?;
    if path.starts_with('-') {
        return None;
    }
    let content = fs::read_to_string(&path).ok()?;
    Some(InitialFile { path, content })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![open_initial_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
