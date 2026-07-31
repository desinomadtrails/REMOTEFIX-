# API Design Guidelines - RemoteFix

## Purpose
Standardizes REST endpoint routes, validations, responses, and error handling.

## Scope
Applies to `apps/api/src/routes/` and middleware configurations.

## Overview
Backend routing is built on Hono. It validates inputs via Zod and wraps controllers to prevent trace leakage.

## Standards
- Routes must be prefixed with `/api/`.
- Validate path/body params via Zod schemas using Hono `zValidator`.
- Responses must match: `{ success: boolean, data?: any, message: string }`.

## Examples
*Response wrapper application:*
```typescript
app.get("/api/health", (c) => c.json({ success: true, message: "Healthy" }));
```

## Related Documents
- [security.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/security.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`apps/api/src/index.ts`, `apps/api/src/routes/`
