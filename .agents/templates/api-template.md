# Hono API Route Template - RemoteFix

## Purpose
Standardizes API endpoint structures inside Hono routers.

## When to use
When creating new REST endpoints in `apps/api/src/routes/`.

## Required inputs
- Route path mapping.
- Input validator schemas.
- Route security roles verification middleware (if needed).

## Example
```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { BookingCreateSchema } from "@remotefix/types";

export const bookingsRouter = new Hono();

bookingsRouter.post("/", zValidator("json", BookingCreateSchema), async (c) => {
  const payload = c.req.valid("json");
  return c.json({ success: true, message: "Booking created", data: payload });
});
```

## Common mistakes
- Bypassing input validators checks.
- throwing raw database errors inside responses.

## Checklist
- [ ] Zod validator schema is attached.
- [ ] Route returns standardized JSON response payloads.
