---
name: RemoteFix AI Framework Compliance
description: Enforces alignment, governance, and responsible behavior for AI operations in the workspace.
---

# RemoteFix AI Framework Compliance Skill

## Purpose
Ensure all automated coding actions adhere to security, logging, and performance limits.

## Scope
Developer prompts, agent runtime configurations, script generators.

## Responsibilities
- Prevent PII leakage.
- Enforce strict typing.

## Decision Rules
- **Rule**: AI agents must run TypeScript compile checks before declaring work done.

## Best Practices
- Refer to [ai.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/ai.md).
- Document any automatic code generation with structured headers.

## Common Mistakes
- Committing temporary script configurations containing sandbox keys.

## Completion Checklist
- `[ ]` Script runs without leakage of security tokens.
