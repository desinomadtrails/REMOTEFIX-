# Database Architecture & Schema Specifications - RemoteFix

## Purpose
Defines database configurations, connection pools, and migration strategies.

## Scope
Applies to `@remotefix/database` configurations, seeds, and SQL migrations.

## Overview
Azure SQL acts as the relational storage, managed via Drizzle ORM.

## Standards
- Connection strings must enforce TLS (`Encrypt=true;TrustServerCertificate=false`).
- Multi-tenant tables must include clustered indices and unique constraints.
- Seed services list using: `npm run db:seed`.

## Examples
*Drizzle config connection url:*
```typescript
const connectionString = `Server=${DB_HOST},1433;Database=${DB_NAME};Encrypt=true;TrustServerCertificate=false;`;
```

## Related Documents
- [decisions.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/decisions.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`packages/database/drizzle.config.ts`, `packages/database/database/client.ts`
