# Security Design & Audit Parameters - RemoteFix

## Purpose
Establishes the platform's security boundaries, authentication models, and audit procedures.

## Scope
Governs access control, encryption, rate limits, and security headers.

## Overview
RemoteFix operates a zero-trust model. Request origins are verified and payloads validated before processing.

## Standards
- **Passwords**: Hashed with PBKDF2 (100,000 iterations, SHA-256) inside Web Crypto.
- **Sessions**: Validated via JWT token middleware.
- **Security Headers**: Enforces CSP, HSTS, X-Frame-Options (DENY), and XSS protections.
- **Rate Limit**: Capped at 150 requests per minute per IP for API, 10 requests per minute for Auth.

## Examples
*Security headers configuration:*
```typescript
c.header("X-Frame-Options", "DENY");
c.header("X-Content-Type-Options", "nosniff");
```

## Related Documents
- [api-guidelines.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/api-guidelines.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`packages/auth/src/index.ts`, `apps/api/src/middleware/security.ts`
