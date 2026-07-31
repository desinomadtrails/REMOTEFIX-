# Dockerfile Template - RemoteFix

## Purpose
Compiles container images running Hono on Node servers.

## When to use
When containerizing applications for production releases.

## Required inputs
- Workspace compile paths.

## Example
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/
RUN npm ci
RUN npm run build
```

## Common mistakes
- Including devDependencies inside final production containers.

## Checklist
- [ ] Dockerfile uses multi-stage builds.
