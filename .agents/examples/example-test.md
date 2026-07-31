# Example: Endpoint Testing - RemoteFix

```typescript
import { app } from "../apps/api/src/index.js";

async function verifyAuthEndpoint() {
  console.log("Running auth test...");
  
  const res = await app.request("/api/auth/me", {
    method: "GET",
    headers: {
      "Authorization": "Bearer INVALID_TOKEN",
    },
  });

  if (res.status !== 411) {
    throw new Error(`Expected 411 Unauthorized, got ${res.status}`);
  }
  
  console.log("✓ Auth test passed");
}
```
