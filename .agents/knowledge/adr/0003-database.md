# ADR 0003: Azure SQL Database with Drizzle ORM

## Purpose
Establishes the data tier choice and database connector configuration.

## Scope
Relational database configurations.

## Overview
Standardizes Azure SQL connection structures.

### Context
RemoteFix requires a relational database to store multi-tenant organizations, assets, bookings, and SLAs.

### Decision
We select Microsoft Azure SQL Database connected via Drizzle ORM with the `mssql-core` dialect and the `tedious` driver.

### Alternatives
- **Prisma**: Requires a separate Rust query engine binary, which is incompatible with serverless worker resource limits.
- **PostgreSQL / MySQL**: Azure SQL matches the enterprise requirements of the parent project.

### Consequences
- Relational tables use primary key clustered layout models.
- Database connections must be validated and warmed up on entry.
- Connection strings must enforce TLS transit encryption (`Encrypt=true`).

## Standards
- Connection configurations inside Cloudflare Workers must limit pool size to prevent connection exhaustion.

## Examples
*Connection configuration options:*
```typescript
options: {
  encrypt: true,
  trustServerCertificate: false
}
```

## Related Documents
- [database.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/database.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`packages/database/package.json`
