# Example: Implementing a Hono Route - RemoteFix

```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { verifyJwt } from "@remotefix/auth";

export const demoRouter = new Hono();

const PayloadSchema = z.object({
  name: z.string().min(2),
});

demoRouter.post("/", verifyJwt, zValidator("json", PayloadSchema), async (c) => {
  const payload = c.req.valid("json");
  return c.json({ success: true, message: "Processed", data: payload });
});
```
