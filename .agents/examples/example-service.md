# Example: Implementing a Service - RemoteFix

```typescript
import { db } from "@remotefix/database";
import { bookings } from "@remotefix/database/schema";
import { eq } from "drizzle-orm";

export class DispatchService {
  async assignTechnician(bookingId: string, engineerId: string) {
    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(bookings)
        .set({ engineerId, status: "assigned", updatedAt: new Date() })
        .where(eq(bookings.id, bookingId))
        .returning();
      return updated;
    });
  }
}
```
