# Playbook: Implementing a New Feature

## Goal
Implement a new product feature across the RemoteFix monorepo.

## Prerequisites
- Feature specifications approved.
- Target workspace packages identified.

## Steps
1. Create a feature branch matching `feature/<name>`.
2. Apply **LEAN CODE FIRST** evaluation: check if existing services or code can resolve the request, or if the architecture already supports the feature, before writing any new code.
3. Define Zod payload schemas in `packages/types/src/index.ts`.
4. If database additions are needed, follow the `database-change` playbook.
5. Implement business workflows inside `packages/` or `apps/api/src/services/`.
6. Add Hono endpoints in `apps/api/src/routes/`.
7. Implement frontend components in `apps/web/` or `apps/admin/`.

## Verification
- Run local typecheck compiling: `npm run typecheck`.
- Execute test suite validations: `npm run test`.

## Rollback
- Delete the local feature branch and revert commits.

## Definition of Done
- Feature executes without errors, passes all checks, and is walkthrough documented.
