# Database Enforceable Standards
- Never execute raw SQL strings directly in backend services. Use Drizzle ORM query builders.
- Define relational models inside `packages/database/database/schema/index.ts`.
- Enforce clustered primary keys and NONCLUSTERED indexes on lookup foreign key columns.
- Set `Encrypt=true;TrustServerCertificate=false;` in all Azure SQL connection pools.
- Keep connection pool sizes below 15 connections per isolate to prevent exhaustion.
- Multi-step modifications must run inside Drizzle transactions (`db.transaction`).
