# RemoteFix Security & Compliance Architecture

## OWASP Top 10 Protections
1. **Broken Access Control:** Database-driven RBAC middleware (`requireAuth`, `requireRole`) and tenant scoping (`organizationId`, `departmentId`) enforced on every endpoint.
2. **Cryptographic Failures:** Passwords hashed with bcrypt; JWT tokens signed with SHA-256 HMAC; SAML 2.0 assertions verified.
3. **Injection:** 100% parameterized SQL query execution via Drizzle ORM.
4. **Insecure Design:** Immutable security audit logging for all authentication, user modification, and RMM script executions.
5. **Security Misconfiguration:** Strict Content-Security-Policy (CSP), HSTS (2 years), X-Frame-Options (DENY), and Cross-Origin Headers enforced via Helmet-equivalent middleware.
6. **Software and Data Integrity Failures:** SHA-256 checksum verification on backup snapshots and signed RMM agent telemetry packets.
