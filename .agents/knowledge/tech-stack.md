# Technology Stack Specification - RemoteFix

## Purpose
Lists verified framework, runtime, database, and library versions used in RemoteFix.

## Scope
Global system package definitions.

## Overview
RemoteFix runs on React 19, Hono v4, Drizzle ORM, and Azure SQL.

## Standards
- **Frontend**: React `^19.0.0`, Vite `^6.0.7`, Tailwind CSS `^4.0.0`, Framer Motion `^12.0.0`.
- **Backend**: Hono `^4.6.14`, @cloudflare/workers-types `^4.20241218.0`.
- **Database**: Drizzle ORM `^1.0.0-rc.4`, mssql driver `^11.0.1` (tedious).

## Examples
*Detected packages overview:*
- `apps/web` uses react `^19.0.0` and vite `^6.0.7`.
- `apps/api` uses hono `^4.6.14` and `@hono/node-server`.

## Related Documents
- [architecture.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/architecture.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`package.json`, `apps/*/package.json`, `packages/*/package.json`
