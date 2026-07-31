---
name: RemoteFix Deployment Pipelines
description: Deploying Cloudflare Workers using Wrangler CLI and bundling SPA assets.
---

# RemoteFix Deployment Pipelines Skill

## Purpose
Deploy applications safely into target server environments.

## Scope
Wrangler settings, Vite bundler parameters.

## Responsibilities
- Check env variables before deploys.

## Decision Rules
- **Rule**: Execute deploy commands only after all tests compile.

## Best Practices
- Refer to [deployment.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/deployment.md).

## Common Mistakes
- Deploying workers with unencrypted environment values.

## Completion Checklist
- `[ ]` Bundles publish to Cloudflare Workers successfully.
