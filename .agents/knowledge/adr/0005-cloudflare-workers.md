# ADR 0005: Multi-Runtime (Workers & Node) API Deployments

## Purpose
Establishes the runtime server selection and target container definitions.

## Scope
API build runtimes.

## Overview
Supports multi-runtime configurations.

### Context
The Hono API must run in Cloudflare Workers during serverless edge scaling, while also supporting containerized Node.js app deployments on Azure App Service.

### Decision
We build Hono routes to compile into standard ES modules that run natively in both Cloudflare Workers and containerized Node servers via `@hono/node-server`.

### Alternatives
- **Cloudflare Workers Only**: Prevents deploying to Azure App Service containers.
- **Node.js Containers Only**: Increases cold start times and prevents edge deployments.

### Consequences
- Local development is emulated using Wrangler.
- Production deployments use Docker containers running on Azure App Service.

## Standards
- API routing must run on both standard Hono Node servers and wrangler dev instances.

## Examples
*Running Node server entry point:*
```typescript
import { serve } from "@hono/node-server";
serve({ fetch: app.fetch, port: 8787 });
```

## Related Documents
- [deployment.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/deployment.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`apps/api/wrangler.toml` and `.github/workflows/main_remotefix-api.yml`
