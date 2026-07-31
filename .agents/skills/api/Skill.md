---
name: RemoteFix API Gateway Design
description: Restful route handling, rate limit middlewares, and HTTP return payloads.
---

# RemoteFix API Gateway Design Skill

## Purpose
Establish secure REST endpoints within Hono Workers.

## Scope
`apps/api/src/routes/` and gateway middleware layers.

## Responsibilities
- Enforce strict parameter validations.
- standard JSON payloads return.

## Decision Rules
- **Rule**: Wrap route controllers with handleController checks to catch exceptions.

## Best Practices
- Refer to [api-guidelines.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/api-guidelines.md).

## Common Mistakes
- returning database error stacks directly in response payloads.

## Completion Checklist
- `[ ]` Endpoint outputs conform to the standard JSON response formats.
