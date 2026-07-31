---
name: RemoteFix Troubleshooting
description: Diagnostic logs checks, tracing stack dumps, and resolving runtime errors.
---

# RemoteFix Troubleshooting Skill

## Purpose
Resolve bugs cleanly using systematic diagnosis.

## Scope
Runtime exceptions, console errors.

## Responsibilities
- Inspect logs to locate faults.
- Verify safe fixes.

## Decision Rules
- **Rule**: Use the logger to inspect variables in serverless worker runtimes.

## Best Practices
- Refer to [memory.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/memory.md).

## Common Mistakes
- Implementing hacks that bypass root validation systems.

## Completion Checklist
- `[ ]` Fix verified across target environments.
