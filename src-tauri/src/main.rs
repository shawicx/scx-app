/*
 * @Author: shawicx d35f3153@proton.me
 * @Description: 
 */
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// mod audio;
mod random;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // audio::check_capabilities,
            // audio::request_permission,
            // audio::start_recording,
            // audio::stop_recording,
            // audio::transcribe_audio,
            random::generate_chinese_name,
            random::generate_english_name,
            random::generate_phone_number,
            random::generate_id_card,
            random::generate_string,
            random::generate_strong_password,
            random::generate_date,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
