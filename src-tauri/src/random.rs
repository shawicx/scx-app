use chrono::prelude::*;
use fake::{Fake, Faker};
use rand::Rng;
use tauri::command;

#[command]
pub fn generate_chinese_name() -> String {
    let faker = Faker;
    // 通过 `fake` crate 的 Name 生成中文姓名
    let name: String = faker.fake();
    name
}

#[command]
pub fn generate_english_name() -> String {
    let name: String = Faker.fake();
    name
}

#[command]
pub fn generate_phone_number() -> String {
    let mut rng = rand::thread_rng();
    let prefixes = vec!["139", "138", "137", "136", "135", "134", "159", "158", "157", "150", "151", "152", "188", "187", "182", "183", "184", "178", "130", "131", "132", "156", "155", "186", "185", "176", "133", "153", "189", "180", "181", "177"];
    let prefix = prefixes[rng.gen_range(0..prefixes.len())];
    let phone_number: String = (0..8)
        .map(|_| rng.gen_range(0..10).to_string())
        .collect();
    format!("{}{}", prefix, phone_number)
}

#[command]
pub fn generate_id_card() -> String {
    let mut rng = rand::thread_rng();
    let province_codes = vec![
        "11", "12", "13", "14", "15", "21", "22", "23", "31", "32", "33", "34", "35", "36", "37",
        "41", "42", "43", "44", "45", "46", "50", "51", "52", "53", "54", "61", "62", "63", "64", "65",
        "71", "81", "82", "91",
    ];
    let province_code = province_codes[rng.gen_range(0..province_codes.len())];
    let city_code: String = (0..4).map(|_| rng.gen_range(0..10).to_string()).collect();
    let district_code: String = (0..4).map(|_| rng.gen_range(0..10).to_string()).collect();
    let birth_date: String = (0..8).map(|_| rng.gen_range(0..10).to_string()).collect();
    let sequence_number: String = (0..3).map(|_| rng.gen_range(0..10).to_string()).collect();
    let check_digit = rng.gen_range(0..10);
    format!(
        "{}{}{}{}{}{}",
        province_code,
        city_code,
        district_code,
        birth_date,
        sequence_number,
        check_digit,
    )
}

#[command]
pub fn generate_string(length: usize) -> String {
    let chars: Vec<char> = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".chars().collect();
    let mut rng = rand::thread_rng();
    (0..length)
        .map(|_| chars[rng.gen_range(0..chars.len())])
        .collect()
}

#[command]
pub fn generate_strong_password() -> String {
    let chars: Vec<char> = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=".chars().collect();
    let mut rng = rand::thread_rng();
    let password: String = (0..12)
        .map(|_| chars[rng.gen_range(0..chars.len())])
        .collect();
    password
}

#[command]
pub fn generate_date(format: &str) -> String {
    let now = Utc::now();
    let date_str = match format {
        "YYYY-MM-DD" => now.format("%Y-%m-%d").to_string(),
        "YYYY-MM-DD HH:mm:ss" => now.format("%Y-%m-%d %H:%M:%S").to_string(),
        _ => now.format("%Y-%m-%d").to_string(),
    };
    date_str
}
