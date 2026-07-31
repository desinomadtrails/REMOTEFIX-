# Playbook: Modifying Authentication Flows

## Goal
Modify JWT signatures or hashing parameters securely.

## Prerequisites
- Read [adr/0002-authentication.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/adr/0002-authentication.md).

## Steps
1. Open `@remotefix/auth` source files.
2. Edit PBKDF2 Web Crypto parameters or verifyJWT checks.
3. Update verifyRole middlewares inside the gateway.

## Verification
- Run auth tests in `tests/rc_suite.test.ts`.

## Rollback
- Revert auth changes to restore working cryptographic setups.

## Definition of Done
- Auth tests pass without security leaks.
