# Technical Architecture Reference - RemoteFix

## Purpose
This document provides a single source of truth for the multi-tier engineering layout of the RemoteFix IT Services platform.

## Scope
Applies to all standalone apps and packages compile profiles inside the monorepo workspace.

## Overview
RemoteFix implements a three-tier decoupled model: Vite React SPAs for Client views, Hono Web Router on Workers/Containers for the API Gateway, and Azure SQL Database for relational storage.

## Standards
- Client SPAs interact with Hono solely via HTTPS REST endpoints returning standard JSON payloads.
- Shared packages compile to ES modules targeted at ES2022 compatibility levels.
- Package dependency configurations are strictly unidirectional to prevent compilation circularities.

## Examples
*Unidirectional workspace dependencies flow map:*
- `apps/api` -> `@remotefix/database`, `@remotefix/auth`, `@remotefix/types`, `@remotefix/utils`
- `apps/web` & `apps/admin` -> `@remotefix/ui`, `@remotefix/types`, `@remotefix/utils`
- Shared packages cannot import application logic.

## Related Documents
- [decisions.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/decisions.md)
- [folder-structure.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/folder-structure.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`package.json`, `tsconfig.json`
