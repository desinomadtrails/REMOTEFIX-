# Security Audit Verification Checklist
- [ ] Password hashes use Web Crypto PBKDF2 iterations.
- [ ] Session tokens verify correctly using JWT HS256 signatures.
- [ ] Route controllers wrap with `handleController` checks to catch exceptions.
- [ ] Access filters enforce RBAC role validation checks on admin endpoints.
- [ ] Sensitive customer attributes (phone, email) are omitted from console outputs.
- [ ] CORS policies restrict allowed origins.
