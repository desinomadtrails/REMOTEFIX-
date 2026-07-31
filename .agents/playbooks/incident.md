# Playbook: Incident Response

## Goal
Restore service availability during crashes.

## Prerequisites
- Access credentials to Azure and Cloudflare dashboards.

## Steps
1. Check Hono system status.
2. Inspect Azure SQL connection pools load levels.
3. Restart container instances if memory limits are breached.

## Verification
- Confirm `/health` responds with a 200 HTTP code.

## Rollback
- Revert the latest deployments if code caused the crash.

## Definition of Done
- Gateway health status returns to normal.
