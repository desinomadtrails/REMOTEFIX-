# GitHub Actions Integration - RemoteFix

## Purpose
Automate code compilation, lint testing, and deployment to Azure.

## Scope
Applies to repository workflows under `.github/workflows/`.

## Overview
GitHub Actions run on pull requests and commits to main, testing and deploying applications automatically.

## Standards
- Validate typecheck compilation runs before builds.
- Azure deployment permissions are validated using OpenID Connect (OIDC) client secrets.

## Examples
*Running compile check workflow:*
```yaml
run: npm run typecheck
```

## Related Documents
- [devops.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/devops.md)
- [deployment.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/deployment.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`.github/workflows/main_remotefix-api.yml`
