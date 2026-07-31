# Drizzle Repository Template - RemoteFix

## Purpose
Standardizes relational queries via Drizzle ORM.

## When to use
When implementing data retrieval/mutation helpers.

## Required inputs
- Target schema tables.

## Example
```typescript
import { db } from "@remotefix/database";
import { users } from "@remotefix/database/schema";
import { eq } from "drizzle-orm";

export class UserRepository {
  async getByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user || null;
  }
}
```

## Common mistakes
- Running SQL strings without Drizzle ORM schema builders.

## Checklist
- [ ] Queries are parameterized.
