# ADR 0004: Hono REST API Gateway with Zod

## Purpose
Establishes Hono REST API patterns and validation strategies.

## Scope
HTTP endpoints layer.

## Overview
Standardizes REST layout checks.

### Context
We need a lightweight, type-safe API routing gateway to validate payloads and handle requests.

### Decision
We use Hono v4 combined with Zod for request validation and standardized response payloads.

### Alternatives
- **Express**: Slower startup times and lacks native typescript interfaces.
- **NestJS**: Too heavy for serverless edge runtimes.

### Consequences
- Shared Zod validation schemas across frontends and the backend.
- Uniform JSON response formats.

## Standards
- All inputs are validated using shared Zod schemas from `@remotefix/types`.

## Examples
*Zod validation hook on post routes:*
```typescript
router.post("/", zValidator("json", schema))
```

## Related Documents
- [api-guidelines.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/api-guidelines.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`apps/api/package.json`
