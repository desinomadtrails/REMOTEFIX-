# Deployment Operations Guide - RemoteFix

## Purpose
Specifies the deployment flow for serverless and containerized environments.

## Scope
Applies to CI workflows, Docker files, and Wrangler deployments.

## Overview
Production releases run inside Docker containers on Azure App Services. Staging or edge builds can deploy to Cloudflare Workers.

## Standards
- Deploy the API to Azure Web Apps using the OIDC deployment workflow.
- Build production static assets using `npm run build` prior to deployment.
- Inject configurations via environment variables (`DATABASE_URL`, `JWT_SECRET`).

## Examples
*Azure Web App deployment step:*
```yaml
uses: azure/webapps-deploy@v3
with:
  app-name: 'remotefix-api'
  package: .
```

## Related Documents
- [devops.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/devops.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`.github/workflows/main_remotefix-api.yml`, `Dockerfile`
