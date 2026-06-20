use tauri::Manager;

#[tauri::command]
fn get_system_info() -> String {
    serde_json::json!({
        "platform": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "app": "RescueMesh",
        "version": "0.1.0",
        "mode": "local-first"
    })
    .to_string()
}

#[tauri::command]
fn get_app_dir() -> String {
    dirs::data_local_dir()
        .map(|p| p.join("rescuemesh").to_string_lossy().to_string())
        .unwrap_or_else(|| ".".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_system_info, get_app_dir])
        .run(tauri::generate_context!())
        .expect("error while running RescueMesh");
}
