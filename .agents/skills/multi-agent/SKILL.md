---
name: RemoteFix Multi-Agent Coordination
description: Splitting tasks between dedicated front-end and back-end subagents.
---

# RemoteFix Multi-Agent Coordination Skill

## Purpose
Delegate complex tasks across distinct role-specific subagents.

## Scope
Workflows delegation.

## Responsibilities
- coordinate task updates.

## Decision Rules
- **Rule**: Run review subagent to audit implementer changes.

## Best Practices
- Refer to [agents.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/agents.md).

## Common Mistakes
- Triggering overlapping file updates simultaneously.

## Completion Checklist
- `[ ]` Task divisions avoid write conflicts.
