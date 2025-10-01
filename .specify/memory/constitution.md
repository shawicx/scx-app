<!-- 
SYNC IMPACT REPORT
Version change: N/A (initial constitution) → 1.0.0
Added sections: All sections (initial constitution)
Templates requiring updates: 
- ✅ .specify/templates/plan-template.md - updated constitution reference
- ⚠ .specify/templates/spec-template.md - no constitution-specific updates needed
- ⚠ .specify/templates/tasks-template.md - no constitution-specific updates needed
Removed sections: N/A
Modified principles: N/A
Follow-up TODOs: None
 -->

# scx-app Constitution

## Core Principles

### I. Desktop-First Application
Every feature is designed with desktop application workflows in mind; Applications must be responsive, performant, and leverage native OS capabilities; Clear user experience required - no server-only solutions where desktop can provide better UX.

### II. Tauri + Vue 3 Architecture
All frontend functionality uses Vue 3 with Composition API; Tauri provides native system access via Rust backend; Text-based configuration and communication protocols: JSON over established APIs for all inter-process communication.

### III. Test-First (NON-NEGOTIABLE)
TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced; Unit tests for all business logic, integration tests for API boundaries.

### IV. Secure by Default
Focus areas requiring security consideration: API permission boundaries, file system access, network requests; All external communications must be validated; User data must be protected with appropriate encryption.

### V. Cross-Platform Compatibility
All features must work identically across Windows, macOS, and Linux; Platform-specific code should be isolated and wrapped with consistent interfaces; Performance targets must be met on minimum spec systems.

## Additional Constraints

Technology stack requirements: Vue 3, Tauri 2.x, Rust for system-level operations, JavaScript/TypeScript for frontend logic; Deployment must support major desktop platforms (Win, Mac, Linux); File I/O operations must use Tauri's secure APIs.

## Development Workflow

Code review requirements: All PRs must include documentation of cross-platform testing; Testing gates require unit test coverage >80% and all integration tests passing; Deployment approval process requires successful builds on all target platforms.

## Governance

All PRs/reviews must verify compliance with desktop application security model; Complexity must be justified with user experience improvements; Use agent-specific guidance files for runtime development guidance.

**Version**: 1.0.0 | **Ratified**: 2025-09-30 | **Last Amended**: 2025-09-30