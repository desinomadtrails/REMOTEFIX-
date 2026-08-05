# Changelog

All notable changes to the RemoteFix platform will be documented in this file.

## [v1.1.0-rc1] - 2026-08-05 - Release Candidate 1

### Added
- **Production Hardening (Phase 3.3)**:
  - Startup `JWT_SECRET` validation guard (`validateJwtSecret()`) enforcing 32+ character requirement in production.
  - Environment-based CORS origin resolution (`resolveCorsOrigin()`) reading from `CORS_ALLOWED_ORIGINS` in production and permitting localhost in development.
  - Response payload compression middleware (`hono/compress`) for API optimization.
  - Docker multi-stage build layer caching isolation for package manifests (`packages/*/package.json`, `apps/*/package.json`).
  - Production readiness report artifact `docs/PRODUCTION_READINESS_REPORT.md` and release candidate audit `docs/V1.1.0_RELEASE_CANDIDATE.md`.
  - Deployment resilience guards with secret checks across all 3 Azure deployment workflows (`azure-api.yml`, `azure-web.yml`, `azure-admin.yml`).

### Changed
- Monorepo production build step moved prior to workspace typecheck in `ci.yml` to prevent clean runner declaration file missing errors.

---

## [1.0.2] - Phase 3.1 Repository Stabilization

### Added
- Multi-branch CI trigger support for `develop`, `main`, `release/*`, and PRs in `.github/workflows/ci.yml`.
- Comprehensive Phase 3 progress documentation in `docs/PHASE3_PROGRESS.md`.

### Changed
- Streamlined GitHub Actions workflows for Azure deployment (`azure-api.yml`, `azure-web.yml`, `azure-admin.yml`).
- Updated system architecture documentation in `docs/ARCHITECTURE.md`.

### Removed
- Redundant and conflicting workflow files: `ci-cd.yml`, `main_remotefix.yml`, `main_remotefix-api.yml`, `azure-static-web-apps-gray-field-02b371100.yml`, `azure-static-web-apps-orange-field-0294c8e00.yml`.
