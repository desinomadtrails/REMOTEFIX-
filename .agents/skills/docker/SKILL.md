---
name: RemoteFix Containerization
description: Multi-stage Docker optimization for React SPA static files.
---

# RemoteFix Containerization Skill

## Purpose
Package static applications using standard multi-stage builds.

## Scope
`Dockerfile` and docker compose configurations.

## Responsibilities
- Standardize build stages.

## Decision Rules
- **Rule**: Use lightweight Alpine node images to limit vulnerabilities footprint.

## Best Practices
- Refer to [deployment.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/deployment.md).

## Common Mistakes
- Including source git repositories inside final containers.

## Completion Checklist
- `[ ]` Docker build completes.
