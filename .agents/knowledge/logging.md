# Logging Standards - RemoteFix

## Purpose
Establishes rules for structured logging, PII masking, and serverless console output to ensure searchability and compliance.

## Scope
Governs the `@remotefix/utils` logging library, Hono logger middlewares, and any print statements across all workspaces.

## Overview
Logging provides operational visibility without exposing sensitive client data. All logs are structured as JSON in production for ingestion by collectors like Datadog or Loki.

## Standards
1. **PII Masking**: Never print passwords, JWTs, emails, phone numbers, or addresses.
2. **JSON Format**: In production, serialize logs using `console.log(JSON.stringify(log))` for consistency.
3. **Structured Fields**: Include `requestId`, `timestamp`, `method`, `url`, `status`, and `durationMs` on HTTP logs.

## Examples
*Structured logging middleware configuration:*
```typescript
import { MiddlewareHandler } from "hono";
export const structuredLogger: MiddlewareHandler = async (c, next) => {
  const startTime = Date.now();
  const requestId = c.req.header("X-Request-ID") || crypto.randomUUID();
  await next();
  const durationMs = Date.now() - startTime;
  console.log(JSON.stringify({
    requestId,
    timestamp: new Date().toISOString(),
    method: c.req.method,
    url: c.req.path,
    status: c.res.status,
    durationMs
  }));
};
```

## Related Documents
- [observability.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/observability.md)
- [security.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/security.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`apps/api/src/middleware/logging.ts`
