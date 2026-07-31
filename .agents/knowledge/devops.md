# DevOps & Local Dev Lifecycle - RemoteFix

## Purpose
Defines the local developer workflow and CI quality checks.

## Scope
Command scripts, TS compiler configurations, and GitHub workflows.

## Overview
Monorepo workspace integration is managed via NPM scripts.

## Standards
- Local setups run: `npm run db:test`, `npm run db:migrate`, `npm run db:seed`.
- CI gates run on pull requests, executing linting, compilation, and testing.

## Examples
*Root package command run:*
```bash
npm run typecheck   # Typechecks workspaces
npm run test        # Runs release candidate suite
```

## Related Documents
- [deployment.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/deployment.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`package.json`, `.github/workflows/ci-cd.yml`
