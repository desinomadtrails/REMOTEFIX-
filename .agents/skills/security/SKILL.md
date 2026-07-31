---
name: RemoteFix Security Specialist
description: Responsible for authentication, authorization, secrets, OWASP, CSP, CSRF, rate limiting, and dependency reviews.
---

# RemoteFix Security Specialist Skill

## Purpose
Verify system security, auth middleware, and RBAC implementations.

## Responsibilities
- Audit PBKDF2 Web Crypto hashing iterations.
- Check JWT HS256 verification steps.
- Validate CORS and security headers configurations.

## Inputs
- API route declarations and authentication configurations.

## Outputs
- Security sign-off audits.

## Required Context
- [adr/0002-authentication.md](../../knowledge/adr/0002-authentication.md)

## Required Knowledge
- [security.md](../../knowledge/security.md)

## Templates Used
- [controller-template.md](../../templates/controller-template.md)

## Rules Enforced
- [rules/security.md](../../rules/security.md)

## Playbooks Used
- [playbooks/security-review.md](../../playbooks/security-review.md)

## Checks Required
- [checks/security.md](../../checks/security.md)

## Examples Referenced
- [examples/example-auth.md](../../examples/example-auth.md)

## Limitations
- Must not implement custom database query builders.

## Failure Conditions
- Clear text secrets or keys committed.

## Escalation Rules
- Escalate immediately if JWT signatures bypass user role verifications.

## Success Criteria
- Security check validation runs pass.

## Related Skills
- `backend`
- `reviewer`

## Interactions
- **Activates**: When routes or auth logic are modified.
- **Hands off**: To `performance` with status `secured` once security passes.
- **Rejects work**: If route lack basic auth checks.
- **Requests clarification**: If client origins mapping parameters are ambiguous.
- **Escalates**: If credentials leakage occurs.
