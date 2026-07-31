# Playbook: Implementing a Database Schema Change

## Goal
Add or modify Azure SQL tables safely via Drizzle ORM.

## Prerequisites
- Verified local connection.

## Steps
1. Edit table schemas in `packages/database/database/schema/index.ts`.
2. Generate migration script: `npm run db:generate`.
3. Audit the SQL output migration under `packages/database/database/migrations/`.
4. Run migrations locally: `npm run db:migrate`.
5. Run connection verification tests: `npm run db:test`.

## Verification
- Verify table constraints and index columns match database expectations.

## Rollback
- Revert Drizzle table edits and execute compensating raw DDL rollbacks.

## Definition of Done
- Relational tables compile, migrations apply successfully, and tests pass.
