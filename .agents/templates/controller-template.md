# Hono Controller Wrapper Template - RemoteFix

## Purpose
Wraps controllers to intercept exceptions and logging.

## When to use
For all business endpoints handlers.

## Required inputs
- Context options.

## Example
```typescript
import type { Context } from "hono";
import { logger } from "@remotefix/utils";

export const handleController = (fn: (c: Context) => Promise<Response>) => {
  return async (c: Context): Promise<Response> => {
    try {
      return await fn(c);
    } catch (err: any) {
      logger.error("Controller Error captured", err);
      return c.json({ success: false, message: "Server error occurred." }, 500);
    }
  };
};
```

## Common mistakes
- Throwing exceptions from route callbacks without wrapper logs checks.

## Checklist
- [ ] Controller wraps inside try-catch structure.
