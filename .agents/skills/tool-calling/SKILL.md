---
name: RemoteFix Tool Execution
description: Interacting with terminal commands and file modifiers.
---

# RemoteFix Tool Execution Skill

## Purpose
Ensure tool execution does not result in syntax errors.

## Scope
Command parameters.

## Responsibilities
- Check command parameters.

## Decision Rules
- **Rule**: Do not launch infinite backend processes without timeout flags.

## Best Practices
- Refer to [mcp.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/mcp.md).

## Common Mistakes
- Running commands with incorrect relative paths.

## Completion Checklist
- `[ ]` Command completes with 0 exit code.
