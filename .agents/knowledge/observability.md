# Observability & Distributed Tracing - RemoteFix

## Purpose
Track gateway execution timelines and trace transactions across asynchronous boundaries.

## Scope
Hono tracing middleware, request lifecycles, and backend integrations.

## Overview
Distributed tracing tags incoming HTTP requests with tracking IDs, propagating them to client headers and database queries.

## Standards
1. **Request ID**: Header `X-Request-ID` is assigned on entry via `crypto.randomUUID()`.
2. **Correlation ID**: Header `X-Correlation-ID` maps request chains across independent services.
3. **Propagation**: Include tracing headers on all upstream database and external service queries.

## Examples
*Tracing propagation middleware:*
```typescript
export const distributedTracing: MiddlewareHandler = async (c, next) => {
  const correlationId = c.req.header("x-correlation-id") || c.req.header("x-request-id") || crypto.randomUUID();
  c.header("x-correlation-id", correlationId);
  c.header("x-request-id", correlationId);
  await next();
};
```

## Related Documents
- [logging.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/logging.md)
- [metrics.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/metrics.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`apps/api/src/middleware/tracing.ts`
