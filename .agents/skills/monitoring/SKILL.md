---
name: RemoteFix Health & Alerting
description: Monitoring connection pool exhaustion and API gateway availability.
---

# RemoteFix Health & Alerting Skill

## Purpose
Track Azure SQL database connections health and gateway uptime.

## Scope
Telemetry alerts, check queries.

## Responsibilities
- Detect pool lockups.

## Decision Rules
- **Rule**: Alert systems if database connection timeouts exceed limits.

## Best Practices
- Refer to [decisions.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/decisions.md).

## Common Mistakes
- Failing to trigger alerts when worker memory limits are breached.

## Completion Checklist
- `[ ]` Health check returns system status.
