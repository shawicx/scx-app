mod random;

// 引入具体的方法
use random::{
    generate_chinese_name,
    generate_date,
    generate_english_name,
    generate_id_card,
    generate_phone_number,
    generate_string,
    generate_strong_password,
};


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            generate_chinese_name,
            generate_english_name,
            generate_phone_number,
            generate_id_card,
            generate_string,
            generate_strong_password,
            generate_date
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
