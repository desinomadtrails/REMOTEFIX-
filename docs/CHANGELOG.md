# Changelog

All notable changes to the RemoteFix platform will be documented in this file.

## [Unreleased] - Phase 3.1 Repository Stabilization

### Added
- Multi-branch CI trigger support for `develop`, `main`, `release/*`, and PRs in `.github/workflows/ci.yml`.
- Comprehensive Phase 3 progress documentation in `docs/PHASE3_PROGRESS.md`.

### Changed
- Streamlined GitHub Actions workflows for Azure deployment (`azure-api.yml`, `azure-web.yml`, `azure-admin.yml`).
- Updated system architecture documentation in `docs/ARCHITECTURE.md`.

### Removed
- Redundant and conflicting workflow files: `ci-cd.yml`, `main_remotefix.yml`, `main_remotefix-api.yml`, `azure-static-web-apps-gray-field-02b371100.yml`, `azure-static-web-apps-orange-field-0294c8e00.yml`.
