# Example: Using Web Cryptography API Hashing - RemoteFix

```typescript
import { hashPassword, verifyPassword } from "@remotefix/auth";

async function demoAuthentication() {
  const password = "my-secure-password";
  const hash = await hashPassword(password);
  
  // Verify matching passwords
  const isMatch = await verifyPassword(password, hash);
  console.log(`Password matches: ${isMatch}`); // true
}
```
