---
name: RemoteFix Refactoring Standards
description: Splitting modular components and eliminating duplicate database models.
---

# RemoteFix Refactoring Standards Skill

## Purpose
Maintain clear, reusable components throughout the monorepo workspace.

## Scope
Legacy files.

## Responsibilities
- Consolidate common actions.

## Decision Rules
- **Rule**: Decompose components that exceed 400 lines of logic.

## Best Practices
- Refer to [workflows.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/workflows.md).

## Common Mistakes
- Refactoring files without matching tests coverage.

## Completion Checklist
- `[ ]` Tests compile cleanly post-refactor.
