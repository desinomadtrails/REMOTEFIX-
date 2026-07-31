---
name: RemoteFix Logging Standards
description: Structured serverless logger parameters and data masking rules.
---

# RemoteFix Logging Standards Skill

## Purpose
Generate searchable telemetry logs safely.

## Scope
Utility log engines.

## Responsibilities
- Mask sensitive attributes.

## Decision Rules
- **Rule**: Block logs from capturing JWT values or password inputs.

## Best Practices
- Refer to [coding-standards.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/coding-standards.md).

## Common Mistakes
- Logging user email parameters in plain text.

## Completion Checklist
- `[ ]` Telemetry engine masks private details.
