<!--
SYNC IMPACT REPORT
Version change: 1.0.0 → 1.1.0
Added sections: Enhanced file processing and media streaming principles
Modified principles:
  - I. Desktop-First Application → Multi-Platform Desktop Application
  - II. Tauri + Vue 3 Architecture → Tauri v2 + Vue 3 Architecture
  - V. Cross-Platform Compatibility → Multi-Platform Distribution & Performance
  - Added new principles for file processing and media streaming
Removed sections: N/A
Templates requiring updates:
- ✅ .specify/templates/plan-template.md - updated constitution reference
- ⚠ .specify/templates/spec-template.md - needs review for media processing requirements
- ⚠ .specify/templates/tasks-template.md - needs review for file/media processing tasks
- ⚠ .specify/templates/commands/constitution.md - updated to reflect new version
Follow-up TODOs: None
 -->

# scx-app Constitution

## Core Principles

### I. Multi-Platform Desktop Application
Every feature is designed with desktop application workflows in mind, targeting personal users across platforms; Applications must be responsive, performant, and leverage native OS capabilities for file processing, data manipulation, and media streaming; Clear user experience required - no server-only solutions where desktop can provide better performance and user data privacy.

### II. Tauri v2 + Vue 3 Architecture
All frontend functionality uses Vue 3 with Composition API; Tauri v2 provides native system access via Rust backend; Text-based configuration and communication protocols: JSON over established APIs for all inter-process communication; Tauri v2 security model must be strictly followed with proper permission scoping.

### III. Test-First (NON-NEGOTIABLE)
TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced; Unit tests for all business logic, integration tests for API boundaries, and cross-platform compatibility tests for all features; Coverage threshold >85% for file/media processing components.

### IV. Secure by Default
Focus areas requiring security consideration: API permission boundaries (especially file system, audio/video), file system access with least-privilege principle, network requests validation; All external communications must be validated; User data must be protected with appropriate encryption; Media processing must prevent execution of malicious files.

### V. Multi-Platform Distribution & Performance
All features must work identically across Windows, macOS, and Linux; Platform-specific code should be isolated and wrapped with consistent interfaces; Performance targets must be met on minimum spec systems (especially for media processing); Must provide official installation packages for Mac and Windows platforms.

## File Processing & Data Handling Constraints

File processing requirements: All file I/O operations must use Tauri's secure APIs with proper permission handling; Large file processing should be chunked and streamed to avoid memory issues; Data integrity verification required for all file operations; Backup and recovery mechanisms must be implemented for user data protection.

## Media Processing Standards

Audio/video streaming functionality: Media processing must be offloaded to native Rust backend for performance; Memory management critical during media streaming to prevent leaks; Asynchronous processing required for smooth UI experience during media operations; Support for common formats (MP4, MP3, WAV, etc.) with extensibility for additional formats.

## Development Workflow

Code review requirements: All PRs must include documentation of cross-platform testing and performance benchmarks for file/media operations; Testing gates require unit test coverage >85% and all integration tests passing; Deployment approval process requires successful builds on all target platforms and package distribution verification.

## Governance

All PRs/reviews must verify compliance with desktop application security model, file processing safety, and media streaming performance; Complexity must be justified with user experience improvements; Installation package generation for Mac and Windows platforms must be part of deployment process; Use agent-specific guidance files for runtime development guidance.

**Version**: 1.1.0 | **Ratified**: 2025-09-30 | **Last Amended**: 2025-09-30
