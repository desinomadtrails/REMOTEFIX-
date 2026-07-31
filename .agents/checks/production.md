# Production Readiness Verification Checklist
- [ ] Azure SQL database connection uses transit TLS encryption options.
- [ ] Hono gateway rate limiters are active on endpoints.
- [ ] JWT token secret variables are securely generated and set in the environment.
- [ ] Liveness and readiness endpoints (/health, /health/liveness) return 200 HTTP codes.
- [ ] Container Dockerfile bundles successfully.
