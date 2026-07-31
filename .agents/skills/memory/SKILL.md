---
name: RemoteFix Memory Management
description: Managing task checklists persistence and state recovery.
---

# RemoteFix Memory Management Skill

## Purpose
Maintain task state consistency across execution sessions.

## Scope
Task logs.

## Responsibilities
- Update checklists.

## Decision Rules
- **Rule**: Record changes immediately inside task.md.

## Best Practices
- Refer to [memory.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/memory.md).

## Common Mistakes
- Forgetting to mark tasks as complete when edits compile.

## Completion Checklist
- `[ ]` Task file matches git diff state.
