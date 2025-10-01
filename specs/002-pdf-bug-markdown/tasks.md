# Tasks: Multi-Function Desktop App - PDF, Data & Audio Tools

**Input**: Design documents from `/specs/002-pdf-bug-markdown/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup
- [x] T001 Create project structure per implementation plan in src/components/, src/models/, src/services/, src/views/, src/composables/, src-tauri/src/, tests/unit/, tests/integration/, tests/contract/, src-tauri/src/audio/
- [x] T002 Install dependencies: pdfjs-dist, wavesurfer.js, jszip, file-saver as specified in technical context
- [x] T003 [P] Configure Tailwind CSS and ensure PrimeVue is properly set up with minimal custom styles

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T004 [P] Contract test POST /file/process/pdf-to-image in tests/contract/test_file_processing_pdf_to_image.js
- [x] T005 [P] Contract test POST /file/process/markdown-to-pdf in tests/contract/test_file_processing_markdown_to_pdf.js
- [x] T006 [P] Contract test GET /file/job/{jobId} in tests/contract/test_file_job_status.js
- [x] T007 [P] Contract test POST /data/generate/random in tests/contract/test_data_generation_random.js
- [x] T008 [P] Contract test POST /data/copy-to-clipboard in tests/contract/test_data_copy_to_clipboard.js
- [x] T009 [P] Contract test GET /data/china-regions in tests/contract/test_data_china_regions.js
- [x] T010 [P] Contract test POST /data/text-compare in tests/contract/test_data_text_compare.js
- [x] T011 [P] Contract test POST /audio/record-to-text in tests/contract/test_audio_record_to_text.js
- [x] T012 [P] Contract test POST /audio/trim in tests/contract/test_audio_trim.js
- [x] T013 [P] Contract test POST /audio/convert in tests/contract/test_audio_convert.js
- [x] T014 [P] Contract test POST /audio/merge in tests/contract/test_audio_merge.js
- [x] T015 [P] Contract test POST /audio/volume-adjust in tests/contract/test_audio_volume_adjust.js
- [x] T016 [P] Contract test POST /audio/metadata in tests/contract/test_audio_metadata.js
- [x] T017 [P] Contract test GET /audio/waveform in tests/contract/test_audio_waveform.js
- [x] T018 [P] Contract test GET /audio/job/{jobId} in tests/contract/test_audio_job_status.js
- [x] T019 [P] Integration test Large File Processing Validation in tests/integration/test_large_file_processing.js
- [x] T020 [P] Integration test Data Tools Validation in tests/integration/test_data_tools_validation.js
- [x] T021 [P] Integration test Audio Processing Validation in tests/integration/test_audio_processing_validation.js
- [x] T022 [P] Integration test Cross-Platform Validation in tests/integration/test_cross_platform_validation.js

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T023 [P] File Processing Job model in src/models/file-job.js
- [x] T024 [P] Audio Processing Job model in src/models/audio-job.js
- [x] T025 [P] Generated Data model in src/models/generated-data.js
- [x] T026 [P] Chinese Administrative Region Data model in src/models/china-regions-data.js
- [x] T027 [P] Audio File model in src/models/audio-file.js
- [x] T028 [P] Text Document model in src/models/text-document.js
- [x] T029 File Processing Service in src/services/file-processing-service.js
- [x] T030 Data Generation Service in src/services/data-generation-service.js
- [x] T031 Audio Processing Service in src/services/audio-processing-service.js
- [x] T032 China Regions Service in src/services/china-regions-service.js
- [x] T033 Text Comparison Service in src/services/text-comparison-service.js
- [x] T034 POST /file/process/pdf-to-image endpoint in src-tauri/src/lib.rs
- [x] T035 POST /file/process/markdown-to-pdf endpoint in src-tauri/src/lib.rs
- [x] T036 GET /file/job/{jobId} endpoint in src-tauri/src/lib.rs
- [x] T037 POST /data/generate/random endpoint in src-tauri/src/lib.rs
- [x] T038 POST /data/copy-to-clipboard endpoint in src-tauri/src/lib.rs
- [x] T039 GET /data/china-regions endpoint in src-tauri/src/lib.rs
- [x] T040 POST /data/text-compare endpoint in src-tauri/src/lib.rs
- [x] T41 POST /audio/record-to-text endpoint in src-tauri/src/lib.rs
- [x] T42 POST /audio/trim endpoint in src-tauri/src/lib.rs
- [x] T43 POST /audio/convert endpoint in src-tauri/src/lib.rs
- [x] T44 POST /audio/merge endpoint in src-tauri/src/lib.rs
- [x] T45 POST /audio/volume-adjust endpoint in src-tauri/src/lib.rs
- [x] T46 POST /audio/metadata endpoint in src-tauri/src/lib.rs
- [x] T47 GET /audio/waveform endpoint in src-tauri/src/lib.rs
- [x] T48 GET /audio/job/{jobId} endpoint in src-tauri/src/lib.rs
- [x] T49 Add audio processing modules to src-tauri/src/audio/processing.rs
- [x] T50 Add audio metadata module to src-tauri/src/audio/metadata.rs
- [x] T51 Update Cargo.toml with required Rust dependencies (hound, rodio, ffmpeg)
- [x] T52 Error handling and validation in src/lib/api-helpers.js

## Phase 3.4: Integration
- [x] T53 Connect File Processing Service to Tauri backend in src/services/file-processing-service.js
- [x] T54 Connect Data Generation Service to Tauri backend in src/services/data-generation-service.js
- [x] T55 Connect Audio Processing Service to Tauri backend in src/services/audio-processing-service.js
- [x] T56 Connect China Regions Service to Tauri backend in src/services/china-regions-service.js
- [x] T57 Connect Text Comparison Service to Tauri backend in src/services/text-comparison-service.js
- [x] T58 Configure Tauri permissions for file system access in tauri.conf.json
- [x] T59 Request/response logging in src/lib/logging.js
- [x] T60 Security validation for all API endpoints in src/lib/security.js

## Phase 3.5: Polish
- [x] T61 [P] Unit tests for File Processing Job model in tests/unit/test_file_job.js
- [x] T62 [P] Unit tests for Audio Processing Job model in tests/unit/test_audio_job.js
- [x] T63 [P] Unit tests for Generated Data model in tests/unit/test_generated_data.js
- [x] T64 [P] Unit tests for Chinese Administrative Region Data model in tests/unit/test_china_regions_data.js
- [x] T65 [P] Unit tests for Audio File model in tests/unit/test_audio_file.js
- [x] T66 [P] Unit tests for Text Document model in tests/unit/test_text_document.js
- [x] T67 [P] Unit tests for File Processing Service in tests/unit/test_file_processing_service.js
- [x] T68 [P] Unit tests for Data Generation Service in tests/unit/test_data_generation_service.js
- [x] T69 [P] Unit tests for Audio Processing Service in tests/unit/test_audio_processing_service.js
- [x] T70 [P] Unit tests for China Regions Service in tests/unit/test_china_regions_service.js
- [x] T71 [P] Unit tests for Text Comparison Service in tests/unit/test_text_comparison_service.js
- [x] T72 [P] Unit tests for PDF to image component in tests/unit/test_pdf_to_image_component.js
- [x] T73 [P] Unit tests for audio waveform component in tests/unit/test_audio_waveform_component.js
- [x] T74 Performance tests for large file processing (<200ms response and efficient memory usage)
- [x] T75 [P] Update docs/api.md with API documentation for all endpoints
- [x] T76 Remove duplication in validation logic across services
- [x] T77 Run quickstart validation scenarios from quickstart.md

## Dependencies
- Tests (T004-T022) before implementation (T023-T52)
- T023 blocks T029
- T024 blocks T031
- T026 blocks T030
- T027 blocks T032
- T028 blocks T033
- T029 blocks T053
- T030 blocks T054
- T031 blocks T055
- T032 blocks T056
- T033 blocks T057
- T051 blocks T049, T050
- T049 blocks T041-T048
- T050 blocks T046, T047
- Implementation before polish (T061-T077)

## Parallel Example
```
# Launch T004-T018 together:
Task: "Contract test POST /file/process/pdf-to-image in tests/contract/test_file_processing_pdf_to_image.js"
Task: "Contract test POST /file/process/markdown-to-pdf in tests/contract/test_file_processing_markdown_to_pdf.js"
Task: "Contract test GET /file/job/{jobId} in tests/contract/test_file_job_status.js"
Task: "Contract test POST /data/generate/random in tests/contract/test_data_generation_random.js"
Task: "Contract test POST /data/copy-to-clipboard in tests/contract/test_data_copy_to_clipboard.js"
Task: "Contract test GET /data/china-regions in tests/contract/test_data_china_regions.js"
Task: "Contract test POST /data/text-compare in tests/contract/test_data_text_compare.js"
Task: "Contract test POST /audio/record-to-text in tests/contract/test_audio_record_to_text.js"
Task: "Contract test POST /audio/trim in tests/contract/test_audio_trim.js"
Task: "Contract test POST /audio/convert in tests/contract/test_audio_convert.js"
Task: "Contract test POST /audio/merge in tests/contract/test_audio_merge.js"
Task: "Contract test POST /audio/volume-adjust in tests/contract/test_audio_volume_adjust.js"
Task: "Contract test POST /audio/metadata in tests/contract/test_audio_metadata.js"
Task: "Contract test GET /audio/waveform in tests/contract/test_audio_waveform.js"
Task: "Contract test GET /audio/job/{jobId} in tests/contract/test_audio_job_status.js"

# Launch T023-T028 together:
Task: "File Processing Job model in src/models/file-job.js"
Task: "Audio Processing Job model in src/models/audio-job.js"
Task: "Generated Data model in src/models/generated-data.js"
Task: "Chinese Administrative Region Data model in src/models/china-regions-data.js"
Task: "Audio File model in src/models/audio-file.js"
Task: "Text Document model in src/models/text-document.js"

# Launch T061-T066 together:
Task: "Unit tests for File Processing Job model in tests/unit/test_file_job.js"
Task: "Unit tests for Audio Processing Job model in tests/unit/test_audio_job.js"
Task: "Unit tests for Generated Data model in tests/unit/test_generated_data.js"
Task: "Unit tests for Chinese Administrative Region Data model in tests/unit/test_china_regions_data.js"
Task: "Unit tests for Audio File model in tests/unit/test_audio_file.js"
Task: "Unit tests for Text Document model in tests/unit/test_text_document.js"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
   
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
   
3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests
- [x] All entities have model tasks
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task