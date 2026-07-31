# Health Probes & Monitoring - RemoteFix

## Purpose
Define liveness, readiness, and service health check endpoints for container and serverless health audits.

## Scope
Applies to system endpoints, container runtime configs, and infrastructure uptime checks.

## Overview
Monitoring checks ensure instances are responsive and can communicate with external resources (like Azure SQL).

## Standards
1. **Liveness Check**: Endpoint `/health/liveness` returns `{ "status": "alive" }` with a 200 HTTP code.
2. **Readiness Probe**: Endpoint `/health` returns `{ "status": "healthy" }` if database connection handshakes succeed.

## Examples
*Liveness route configuration:*
```typescript
app.get("/health/liveness", (c) => c.json({ status: "alive" }));
```

## Related Documents
- [metrics.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/metrics.md)
- [alerts.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/alerts.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`apps/api/src/routes/health.ts` and `tests/rc_suite.test.ts`
