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

use tauri::command;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

// Define structs for our API contracts
#[derive(Serialize, Deserialize)]
struct GeneratePlanRequest {
    feature_spec_path: String,
    output_path: String,
    constitution_path: String,
}

#[derive(Serialize, Deserialize)]
struct Artifacts {
    research: String,
    data_model: String,
    contracts: Vec<String>,
    quickstart: String,
}

#[derive(Serialize, Deserialize)]
struct Compliance {
    constitution_check: String,
    violations: Vec<String>,
}

#[derive(Serialize, Deserialize)]
struct GeneratePlanResponse {
    plan_path: Option<String>,
    artifacts: Option<Artifacts>,
    status: String,
    compliance: Compliance,
}

#[derive(Serialize, Deserialize)]
struct ProjectStructureResponse {
    #[serde(rename = "type")]
    type_field: String,
    frontend: String,
    backend: String,
    directories: HashMap<String, String>,
}

#[derive(Serialize, Deserialize)]
struct ExecuteContractTestRequest {
    contract_path: String,
    test_type: String,
}

#[derive(Serialize, Deserialize)]
struct ExecuteContractTestResponse {
    test_id: String,
    status: String,
    details: String,
    timestamp: String,
}

// New API endpoints for our feature

#[command]
pub async fn generate_plan(
    request: GeneratePlanRequest,
) -> Result<GeneratePlanResponse, String> {
    // Simulate generating an implementation plan
    // In a real implementation, this would call the actual planning logic
    
    // Validate inputs
    if request.feature_spec_path.is_empty() {
        return Err("Feature spec path is required".to_string());
    }
    
    if request.output_path.is_empty() {
        return Err("Output path is required".to_string());
    }
    
    if request.constitution_path.is_empty() {
        return Err("Constitution path is required".to_string());
    }
    
    // Mock successful plan generation
    Ok(GeneratePlanResponse {
        plan_path: Some(format!("{}/plan.md", request.output_path)),
        artifacts: Some(Artifacts {
            research: format!("{}/research.md", request.output_path),
            data_model: format!("{}/data-model.md", request.output_path),
            contracts: vec![format!("{}/contracts/", request.output_path)],
            quickstart: format!("{}/quickstart.md", request.output_path),
        }),
        status: "completed".to_string(),
        compliance: Compliance {
            constitution_check: "pass".to_string(),
            violations: vec![],
        },
    })
}

#[command]
pub async fn get_project_structure() -> Result<ProjectStructureResponse, String> {
    // Simulate getting project structure
    // In a real implementation, this would analyze the actual project
    
    let mut directories = HashMap::new();
    directories.insert("src".to_string(), "./src".to_string());
    directories.insert("tests".to_string(), "./tests".to_string());
    directories.insert("public".to_string(), "./public".to_string());
    directories.insert("config".to_string(), "./vite.config.js".to_string());
    
    Ok(ProjectStructureResponse {
        type_field: "desktop".to_string(),
        frontend: "vue3".to_string(),
        backend: "tauri".to_string(),
        directories,
    })
}

#[command]
pub async fn execute_contract_test(
    request: ExecuteContractTestRequest,
) -> Result<ExecuteContractTestResponse, String> {
    // Validate inputs
    if request.contract_path.is_empty() {
        return Err("Contract path is required".to_string());
    }
    
    let valid_test_types = ["contract", "integration", "unit"];
    if !valid_test_types.contains(&request.test_type.as_str()) {
        return Err(format!(
            "Invalid test type: {}. Must be one of: {:?}",
            request.test_type, valid_test_types
        ));
    }
    
    // Mock successful test execution
    Ok(ExecuteContractTestResponse {
        test_id: format!("test-{}", std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis()),
        status: "pass".to_string(),
        details: format!(
            "{} test executed successfully for: {}",
            request.test_type, request.contract_path
        ),
        timestamp: chrono::Utc::now().to_rfc3339(),
    })
}

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
            generate_date,
            generate_plan,
            get_project_structure,
            execute_contract_test
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}