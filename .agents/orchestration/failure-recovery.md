# Failure Recovery Strategy - RemoteFix

## Purpose
Define recovery and escalation plans for common compilation, migration, and build failures.

## Scope
Applies to all execution phase errors.

## Overview
Ensures agents can self-correct when errors are detected.

## Standards

### 1. Compilation Failures
- **Detection**: TypeScript compiler returns exit code 1 during `npm run typecheck`.
- **Recovery**: Trace error lines, inspect import type definitions, and correct mismatches.
- **Escalation**: Alert the user if type definitions in external libraries are broken.

### 2. Database Migration Failures
- **Detection**: `npm run db:migrate` fails to apply SQL scripts.
- **Recovery**: Rollback the migration script locally using `drizzle-kit drop`, fix schemas, and generate again.
- **Escalation**: Do not proceed if table locks are detected in Azure SQL. Report locks to the user.

### 3. Deployment Failures
- **Detection**: Wrangler deploy or GitHub deployment action fails.
- **Recovery**: Inspect deployment log, check environment bindings, and re-run.
- **Escalation**: Contact system admin if credentials are invalid.

### 4. Merge Conflicts
- **Detection**: Git merge returns conflict markers.
- **Recovery**: Pull latest `main` branch, resolve conflicts manually, and compile again.
- **Escalation**: Alert user if overlapping file edits conflict.

## Examples
*Compiling error correction action:*
- Fix: Replace implicit `any` type with Zod validated interfaces.

## Related Documents
- [verification.md](file:///e:/SURAJ/REMOTEFIX-/.agents/orchestration/verification.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`PRODUCTION_READINESS_REPORT.md` (health logs checks)
