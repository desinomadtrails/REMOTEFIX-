# Drizzle Schema Table Template - RemoteFix

## Purpose
Enforces table naming conventions and index layout models.

## When to use
When adding database entities to the schema catalog.

## Required inputs
- Column schema maps.

## Example
```typescript
import { mssqlTable, varchar, datetime2 } from "drizzle-orm/mssql-core";
import { sql } from "drizzle-orm";

export const demoTable = mssqlTable("demo_table", {
  id: varchar("id", { length: 36 }).primaryKey(),
  createdAt: datetime2("created_at").notNull().default(sql`(getdate())`),
});
```

## Common mistakes
- Declaring varchar limits without explicit length markers.

## Checklist
- [ ] Clustered index is assigned.
- [ ] CreatedAt and updatedAt columns conform to datetime2 settings.
