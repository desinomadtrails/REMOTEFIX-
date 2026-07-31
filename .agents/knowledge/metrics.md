# Prometheus Metrics Exporter - RemoteFix

## Purpose
Expose service metrics for ingestion by collectors like Prometheus.

## Scope
API route endpoint `/metrics` and internal metrics collection.

## Overview
Metrics collection tracks system usage, active sessions, and database query latency.

## Standards
1. **Prometheus Format**: Output must match Prometheus plaintext guidelines.
2. **Target Metrics**: Expose variables like `remotefix_active_organizations` and route execution rates.

## Examples
*Metrics verification check in release candidate suite:*
```typescript
const res = await app.request("/metrics");
const text = await res.text();
if (!text.includes("remotefix_active_organizations")) throw new Error();
```

## Related Documents
- [monitoring.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/monitoring.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`apps/api/src/routes/metrics.ts` and `tests/rc_suite.test.ts`
