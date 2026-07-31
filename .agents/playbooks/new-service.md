# Playbook: Implementing a New Service

## Goal
Create a backend service to execute business workflow logic.

## Prerequisites
- Target repository or database clients identified.

## Steps
1. Add service class definition under `apps/api/src/services/`.
2. Ensure no Hono gateway context objects are imported.
3. Manage database transaction flows using Drizzle ORM client boundaries.

## Verification
- Verify compilation targets.

## Rollback
- Remove class declarations.

## Definition of Done
- Service logic operates correctly and passes tests.
