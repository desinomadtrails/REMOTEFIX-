# Security Enforceable Standards
- Passwords must be hashed using Web Crypto PBKDF2 with SHA-256 (100,000 iterations).
- Never hardcode API keys, database connection strings, or secrets. Use env variables.
- API endpoints rate limits must enforce: 150 req/min globally, 10 req/min for Auth.
- Exclude user email, phone number, and address parameters from all serverless system logs.
- Protect admin-facing endpoints with JWT role-based access validation (RBAC).
