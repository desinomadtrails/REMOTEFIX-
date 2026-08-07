# Hono REST API & Middleware Architecture Manual

**Author**: Backend Specialist & API Architect  
**Target Gateway**: Hono REST API Core (`apps/api`)  
**Execution Timestamp**: 2026-08-07T14:49:30Z  
**Primary Entry File**: [apps/api/src/index.ts](file:///e:/SURAJ/REMOTEFIX-/apps/api/src/index.ts)  

---

## 1. Gateway Pipeline & Middleware Sequence

Every HTTP request entering the Hono API engine passes through a strict sequential middleware chain:

```
Request ──> Logger (`requestId`) ──> Security Headers (CSP, HSTS) ──> CORS ──> Rate Limiter ──> Auth / RBAC ──> Route Handler
```

### Middleware Specifications

1. **Logger Middleware** ([apps/api/src/middleware/logger.ts](file:///e:/SURAJ/REMOTEFIX-/apps/api/src/middleware/logger.ts)):
   - Generates unique UUID `requestId` on every request.
   - Logs structured JSON with duration in milliseconds (`durationMs`).
2. **Security Headers Middleware** ([apps/api/src/middleware/security.ts](file:///e:/SURAJ/REMOTEFIX-/apps/api/src/middleware/security.ts)):
   - Sets HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, and CSP headers.
3. **Rate Limiting Middleware** ([apps/api/src/middleware/rateLimiter.ts](file:///e:/SURAJ/REMOTEFIX-/apps/api/src/middleware/rateLimiter.ts)):
   - Sliding window IP rate limiting preventing brute-force burst attacks.
4. **RBAC Authorization Middleware** ([apps/api/src/middleware/rbac.ts](file:///e:/SURAJ/REMOTEFIX-/apps/api/src/middleware/rbac.ts)):
   - Evaluates JWT claims (`role: 'admin' | 'technician' | 'customer'`) against requested route permissions.

---

## 2. Summary

- **Backend Architecture Status**: 🟢 **VERIFIED PRODUCTION READY**
