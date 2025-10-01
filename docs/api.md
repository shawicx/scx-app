# API Documentation

This document describes the API endpoints available in the scx-app for the implementation planning workflow.

## Endpoints

### POST /feature/generate-plan

Generates an implementation plan from a feature specification.

#### Request Body
```json
{
  "feature_spec_path": "string",
  "output_path": "string", 
  "constitution_path": "string"
}
```

- `feature_spec_path`: Path to the feature specification file (required)
- `output_path`: Path where the plan should be generated (required)
- `constitution_path`: Path to the project constitution file (required)

#### Response
```json
{
  "plan_path": "string or null",
  "artifacts": {
    "research": "string",
    "data_model": "string",
    "contracts": ["string"],
    "quickstart": "string"
  } or null,
  "status": "string",
  "compliance": {
    "constitution_check": "string",
    "violations": ["string"]
  }
}
```

- `plan_path`: Path to the generated plan file, or null if generation failed
- `artifacts`: Object containing paths to generated artifacts, or null if generation failed
- `status`: Overall status of the operation ("completed" or "error")
- `compliance`: Object containing constitutional compliance information

#### Example Request
```javascript
const response = await invoke('generate_plan', {
  request: {
    feature_spec_path: './specs/my-feature/spec.md',
    output_path: './specs/my-feature/',
    constitution_path: './.specify/memory/constitution.md'
  }
});
```

### GET /project/structure

Retrieves information about the project structure.

#### Response
```json
{
  "type": "string",
  "frontend": "string",
  "backend": "string", 
  "directories": {
    "string": "string"
  }
}
```

- `type`: Project type ("desktop", "web", or "mobile")
- `frontend`: Frontend framework ("vue3", "react", "svelte", etc.)
- `backend`: Backend framework ("tauri", "tauri-rust", "node", "none")
- `directories`: Map of directory names to paths

#### Example Request
```javascript
const response = await invoke('get_project_structure', {});
```

### POST /contract/test

Executes a contract test.

#### Request Body
```json
{
  "contract_path": "string",
  "test_type": "string"
}
```

- `contract_path`: Path to the contract file to test (required)
- `test_type`: Type of test to run ("contract", "integration", or "unit") (required)

#### Response
```json
{
  "test_id": "string",
  "status": "string",
  "details": "string",
  "timestamp": "string"
}
```

- `test_id`: Unique identifier for the test run
- `status`: Test result ("pass", "fail", or "error")
- `details`: Additional details about the test result
- `timestamp`: ISO 8601 timestamp of when the test was executed

#### Example Request
```javascript
const response = await invoke('execute_contract_test', {
  request: {
    contract_path: './specs/my-feature/contracts/api.json',
    test_type: 'contract'
  }
});
```

## Error Handling

All API endpoints follow the same error response format:

```json
{
  "error": {
    "code": 500,
    "message": "string",
    "details": {},
    "timestamp": "string"
  }
}
```

## Security Considerations

- All file paths are validated to prevent directory traversal attacks
- Input parameters are sanitized to prevent injection attacks
- API access is controlled by Tauri's allowlist configuration

## Performance Guidelines

- API endpoints should respond within 200ms for optimal user experience
- File operations should be asynchronous to prevent UI blocking
- Validation should be performed efficiently to minimize response times