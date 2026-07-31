---
name: RemoteFix Incident Actions
description: Auditing logs, checking pool locks, and applying emergency hotfixes.
---

# RemoteFix Incident Actions Skill

## Purpose
Restore service availability during database or gateway crashes.

## Scope
Audit configurations, emergency patches.

## Responsibilities
- Monitor error dumps.

## Decision Rules
- **Rule**: Reset connection configurations if tediously locked.

## Best Practices
- Refer to [database.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/database.md).

## Common Mistakes
- Deploying hotfixes without regression validation runs.

## Completion Checklist
- `[ ]` System status passes health verification checks.
