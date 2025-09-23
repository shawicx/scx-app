use chrono::NaiveDate;
use fake::faker::name::raw::*;
use fake::locales::{EN, ZH_CN};
use fake::Fake;
use rand::seq::SliceRandom;
use rand::Rng;
use tauri::command;

#[command]
pub fn generate_chinese_name() -> String {
    Name(ZH_CN).fake()
}

#[command]
pub fn generate_english_name() -> String {
    Name(EN).fake()
}

#[command]
pub fn generate_phone_number() -> String {
    let mut rng = rand::thread_rng();
    let prefixes = vec![
        "139", "138", "137", "136", "135", "134", "159", "158", "157", "150", "151", "152", "188",
        "187", "182", "183", "184", "178", "130", "131", "132", "156", "155", "186", "185", "176",
        "133", "153", "189", "180", "181", "177",
    ];
    let prefix = prefixes[rng.gen_range(0..prefixes.len())];
    let phone_number: String = (0..8).map(|_| rng.gen_range(0..10).to_string()).collect();
    format!("{}{}", prefix, phone_number)
}

/// 根据身份证前17位计算校验码
fn calc_id_check_digit(id17: &str) -> String {
    let weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    let check_codes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    let sum: usize = id17
        .chars()
        .zip(weights.iter())
        .map(|(c, w)| c.to_digit(10).unwrap_or(0) as usize * *w)
        .sum();
    let idx = sum % 11;
    check_codes[idx].to_string()
}

#[command]
pub fn generate_id_card() -> String {
    // 省级代码（2位）
    let province_codes = [
        "11", "12", "13", "14", "15", "21", "22", "23", "31", "32", "33", "34", "35", "36", "37",
        "41", "42", "43", "44", "45", "46", "50", "51", "52", "53", "54", "61", "62", "63", "64",
        "65", "71", "81", "82", "91",
    ];
    // 市代码、区县代码（各2位，通常01-99）
    let mut rng = rand::thread_rng();
    let province = province_codes.choose(&mut rng).unwrap();
    let city = format!("{:02}", rng.gen_range(1..=20)); // 01-20
    let district = format!("{:02}", rng.gen_range(1..=99)); // 01-99

    // 出生日期，假设1970-01-01 ~ 2010-12-31
    let year = rng.gen_range(1970..=2010);
    let month = rng.gen_range(1..=12);
    // 计算该月的最大天数
    let max_day = NaiveDate::from_ymd_opt(year, month, 1)
        .map(|d| {
            let next_month = if month == 12 { 1 } else { month + 1 };
            let next_year = if month == 12 { year + 1 } else { year };
            (NaiveDate::from_ymd_opt(next_year, next_month, 1)
                .unwrap_or_else(|| NaiveDate::from_ymd_opt(year, month, 28).unwrap()))
            .signed_duration_since(d)
            .num_days() as u32
        })
        .unwrap_or(28);
    let day = rng.gen_range(1..=max_day);
    let birth = format!("{:04}{:02}{:02}", year, month, day);

    // 顺序码（3位）
    let seq = format!("{:03}", rng.gen_range(1..=999));

    // 前17位
    let id17 = format!("{}{}{}{}{}", province, city, district, birth, seq);

    // 校验码
    let check_code = calc_id_check_digit(&id17);

    format!("{}{}", id17, check_code)
}

#[command]
pub fn generate_string(length: usize) -> String {
    let chars: Vec<char> = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        .chars()
        .collect();
    let mut rng = rand::thread_rng();
    (0..length)
        .map(|_| chars[rng.gen_range(0..chars.len())])
        .collect()
}

#[command]
pub fn generate_strong_password() -> String {
    let chars: Vec<char> =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-="
            .chars()
            .collect();
    let mut rng = rand::thread_rng();
    let password: String = (0..12)
        .map(|_| chars[rng.gen_range(0..chars.len())])
        .collect();
    password
}

#[command]
pub fn generate_date(format: &str) -> String {
    let mut rng = rand::thread_rng();
    
    // Generate random date between 2000-01-01 and 2030-12-31
    let start_year = 2000;
    let end_year = 2030;
    let year = rng.gen_range(start_year..=end_year);
    let month = rng.gen_range(1..=12);
    
    // Calculate max days for the month
    let max_day = match month {
        2 => if year % 4 == 0 && (year % 100 != 0 || year % 400 == 0) { 29 } else { 28 },
        4 | 6 | 9 | 11 => 30,
        _ => 31,
    };
    let day = rng.gen_range(1..=max_day);
    
    let date_str = match format {
        "YYYY-MM-DD HH:mm:ss" => {
            let hour = rng.gen_range(0..24);
            let minute = rng.gen_range(0..60);
            let second = rng.gen_range(0..60);
            format!("{:04}-{:02}-{:02} {:02}:{:02}:{:02}", year, month, day, hour, minute, second)
        },
        _ => format!("{:04}-{:02}-{:02}", year, month, day),
    };
    date_str
}
