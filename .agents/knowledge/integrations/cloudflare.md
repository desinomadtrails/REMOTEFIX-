# Cloudflare Wrangler Integration - RemoteFix

## Purpose
Emulate serverless runtimes locally and build worker scripts.

## Scope
Applies to wrangler configurations inside `apps/api/`.

## Overview
Wrangler is used for local emulation of Cloudflare Workers and database connection testing.

## Standards
- Compatibility date: `2026-07-23`
- Must include compatibility flag: `nodejs_compat`

## Examples
*Running local emulator check:*
`npx wrangler dev`

## Related Documents
- [deployment.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/deployment.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`apps/api/wrangler.toml`
