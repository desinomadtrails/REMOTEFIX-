---
name: RemoteFix System Architecture
description: Core specifications governing serverless gateway execution and SPA separation.
---

# RemoteFix System Architecture Skill

## Purpose
Align software layout with high-level system tiers.

## Scope
Workspace boundary configurations.

## Responsibilities
- Optimize serverless startup limits.
- Manage shared dependencies flow.

## Decision Rules
- **Rule**: Workspaces cannot import application modules.

## Best Practices
- Refer to [architecture.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/architecture.md).

## Common Mistakes
- Incorporating Node-specific standard dependencies inside Hono code.

## Completion Checklist
- `[ ]` Component interactions comply with the serverless isolates architecture.
