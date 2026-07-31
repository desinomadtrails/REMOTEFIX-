# ADR 0002: Web Cryptography API Authentication

## Purpose
Defines system-level cryptography boundaries and password hashing libraries selections.

## Scope
API authentication layer and `@remotefix/auth` packages.

## Overview
Standardizes secure cryptos logic.

### Context
The API gateway must execute efficiently inside serverless Cloudflare Workers, which lack support for native Node.js C++ bindings.

### Decision
We use the native Web Cryptography API (`crypto.subtle`) for PBKDF2 password hashing and JWT signature operations.

### Alternatives
- **node-bcrypt**: Incompatible with Cloudflare Workers V8 isolates.
- **jsonwebtoken (npm)**: Relies on Node.js core libraries, which require large polyfill bundles.

### Consequences
- Hashing is done via PBKDF2 using 100,000 iterations and SHA-256.
- Secure, lightweight signature verification running natively inside V8 sandboxes.

## Standards
- Passwords must be hashed using Web Crypto PBKDF2 SHA-256 (100,000 iterations).

## Examples
*Using crypto.subtle for PBKDF2 key derivations:*
```typescript
const baseKey = await crypto.subtle.importKey("raw", pwd, "PBKDF2", false, ["deriveBits"]);
```

## Related Documents
- [security.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/security.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`packages/auth/src/index.ts`
