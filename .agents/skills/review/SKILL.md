---
name: RemoteFix Code Audits
description: Architecture compliance reviews and lint validation rules.
---

# RemoteFix Code Audits Skill

## Purpose
Perform code analysis to keep ratings above 96/100.

## Scope
Modified workspace files.

## Responsibilities
- Validate type integrity.
- Flag architectural code smells.

## Decision Rules
- **Rule**: Code changes must not lower test coverage ratios.

## Best Practices
- Refer to [coding-standards.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/coding-standards.md).

## Common Mistakes
- Accepting implicit code assertions without formal compile validation.

## Completion Checklist
- `[ ]` TypeScript compiler returns no validation warnings.
