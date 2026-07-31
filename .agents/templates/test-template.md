# Endpoint Testing Template - RemoteFix

## Purpose
Ensures routes compile and validate parameters correctly.

## When to use
When writing script validations under the test suite.

## Required inputs
- Route handlers.

## Example
```typescript
import { app } from "../apps/api/src/index.js";

async function verifyRoute() {
  const res = await app.request("/health");
  if (res.status !== 200) throw new Error("Health check failed");
}
```

## Common mistakes
- Running real database queries in unit test sweeps without mocking client connection pools.

## Checklist
- [ ] Test makes requests using Hono `app.request()`.
