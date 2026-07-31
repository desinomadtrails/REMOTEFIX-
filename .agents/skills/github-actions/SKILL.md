---
name: RemoteFix GitHub Workflows
description: Automating pull request quality gates and continuous builds.
---

# RemoteFix GitHub Workflows Skill

## Purpose
Enforce continuous integration validation checks.

## Scope
`.github/workflows/` files.

## Responsibilities
- Maintain run configurations.

## Decision Rules
- **Rule**: Break pipeline runs immediately if tests or lint fails.

## Best Practices
- Refer to [devops.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/devops.md).

## Common Mistakes
- Caching dependencies inefficiently leading to slow integration runs.

## Completion Checklist
- `[ ]` Workflows validate on repository push.
