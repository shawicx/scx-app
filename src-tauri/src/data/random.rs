use fake::faker::name::raw::*;
use fake::locales::{CH_CN, EN};
use fake::Fake;

// ... 其他代码保持不变 ...

#[tauri::command]
pub fn generate_chinese_name() -> RandomResult {
    let name: String = Name(CH_CN).fake();
    RandomResult {
        value: name
    }
}

#[tauri::command]
pub fn generate_english_name() -> RandomResult {
    let first_name: String = FirstName(EN).fake();
    let last_name: String = LastName(EN).fake();
    RandomResult {
        value: format!("{} {}", first_name, last_name)
    }
}
