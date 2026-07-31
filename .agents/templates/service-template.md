# Business Service Template - RemoteFix

## Purpose
Enforces separation of concerns by placing business logic outside of routing.

## When to use
When building workflows or transaction logic.

## Required inputs
- Class interfaces declarations.

## Example
```typescript
import { db } from "@remotefix/database";
import { bookings } from "@remotefix/database/schema";

export class BookingService {
  async completeBooking(bookingId: string) {
    return await db.transaction(async (tx) => {
      // Execute transaction actions using 'tx'
    });
  }
}
```

## Common mistakes
- Declaring Hono context parameters inside services.

## Checklist
- [ ] Service has no gateway dependencies.
- [ ] Database transactions use Drizzle tx bounds.
