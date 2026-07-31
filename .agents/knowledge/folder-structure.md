# Repository Folder Structure - RemoteFix

## Purpose
Maps directory layouts and package responsibilities across the monorepo.

## Scope
Workspace directory map.

## Overview
RemoteFix compiles independent frontends and a backend using NPM Workspaces.

## Standards
- Standalone apps reside in `apps/`.
- Shared modules reside in `packages/`.
- Build targets compile output to `dist/` or `build/` boundaries.

## Examples
*Repository map:*
- `apps/admin`: Admin Console (Vite React SPA)
- `apps/api`: Hono Gateway (Worker / Node server)
- `apps/mobile`: Technician Portal (React UI + offline sync)
- `apps/web`: Customer Portal (Vite React SPA)

## Related Documents
- [coding-standards.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/coding-standards.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`package.json`, filesystem directory structure
