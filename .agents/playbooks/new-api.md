# Playbook: Implementing a New API Endpoint

## Goal
Add a new REST route to the Hono API Gateway.

## Prerequisites
- Zod schema defined in `@remotefix/types`.

## Steps
1. Open or create the target router in `apps/api/src/routes/`.
2. Apply input validation middleware: `zValidator`.
3. Wrap route handlers with `handleController` checks.
4. Integrate route inside `apps/api/src/index.ts`.

## Verification
- Execute `npm run test` and check status codes.

## Rollback
- Revert route registrations inside `apps/api/src/index.ts`.

## Definition of Done
- Endpoint responds with the success/data/message format and is verified.
