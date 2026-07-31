# Context Loading Strategy - RemoteFix

## Purpose
Establishes the order, selection, and token limits for loading project files into agent context.

## Scope
Applies to all filesystem reads and vector DB context retrievals.

## Overview
Context loading must prevent token bloat and hallucination by loading only relevant files.

## Standards

### 1. Priority Order
When gathering context for a task, inspect files in this sequence:
1. **Repository Files**: Actual code, package.json files, and active schemas.
2. **Knowledge Base**: Project-specific files under `knowledge/` (e.g. `tech-stack.md`).
3. **ADRs**: Architectural records under `knowledge/adr/`.
4. **Rules**: Active standards under `rules/`.
5. **Templates**: Structuring templates under `templates/`.
6. **Examples**: Verified implementations under `examples/`.
7. **Playbooks**: Step lists under `playbooks/`.
8. **Previous implementation**: Stored git history and logs.

### 2. Context Size Limits
- Context window allocation must be restricted:
  - Repository files: Max 5 target files (omit large libraries).
  - Knowledge and rules: Max 3 related docs.
  - Templates and examples: Max 1 target template/example block.
- Total injected context should remain below 12,000 tokens per subagent call.

## Examples
*Context search sequence for database changes:*
- Load `packages/database/database/schema/index.ts` -> Load `knowledge/database.md` -> Load `rules/database.md` -> Load `templates/schema-template.md`.

## Related Documents
- [task-routing.md](file:///e:/SURAJ/REMOTEFIX-/.agents/orchestration/task-routing.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`package.json` (workspace structures)
