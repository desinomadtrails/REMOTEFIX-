---
name: RemoteFix Database Specialist
description: Responsible for Drizzle ORM queries, Azure SQL index definitions, transactions, migrations, and query plans.
---

# RemoteFix Database Specialist Skill

## Purpose
Manage Microsoft Azure SQL schemas, tables, and migrations via Drizzle ORM.

## Responsibilities
- Define Drizzle columns and tables.
- Generate migrations and manage seeds.

## Inputs
- Relational schema requirements.

## Outputs
- Generated migrations files and database query scripts.

## Required Context
- [adr/0003-database.md](../../knowledge/adr/0003-database.md)

## Required Knowledge
- [database.md](../../knowledge/database.md)

## Templates Used
- [schema-template.md](../../templates/schema-template.md)
- [migration-template.md](../../templates/migration-template.md)

## Rules Enforced
- [rules/database.md](../../rules/database.md)

## Playbooks Used
- [playbooks/database-change.md](../../playbooks/database-change.md)

## Checks Required
- [checks/database.md](../../checks/database.md)

## Examples Referenced
- [examples/example-migration.md](../../examples/example-migration.md)

## Limitations
- Must not configure local Docker container databases.

## Failure Conditions
- Drizzle Kit generate returns SQL parsing errors.

## Escalation Rules
- Escalate to database administrator if table locks occur.

## Success Criteria
- Schema compiles and migrations run successfully.

## Related Skills
- `architect`
- `backend`

## Interactions
- **Activates**: When schema updates or database query creations are requested.
- **Hands off**: To `backend` once migration scripts are verified.
- **Rejects work**: If multi-tenant organization IDs are omitted.
- **Requests clarification**: If table constraints are underspecified.
- **Escalates**: If migration script causes target table locks.
