---
name: RemoteFix Core Engineering
description: Foundation guidelines for the NPM Workspaces monorepo architecture and workspace packages configuration.
---

# RemoteFix Core Engineering Skill

## Purpose
Enforce modularity, type safety, and package integrity across the monorepo workspace.

## Scope
Workspace configuration, compilation profiles, dependencies definitions under root `package.json` and `packages/`.

## Responsibilities
- Validate dependency flows.
- Enforce ES modules target standards.

## Decision Rules
- **Rule**: Shared workspaces (`packages/*`) must compile to ES modules.
- **Rule**: Never allow cross-imports between `apps/web` and `apps/admin`.

## Best Practices
- Refer to [folder-structure.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/folder-structure.md).
- Import shared packages natively using their workspace aliases (e.g. `@remotefix/ui`).

## Common Mistakes
- Bypassing workspaces and using direct relative path folder imports.

## Completion Checklist
- `[ ]` Code compiles using `npm run build`.
