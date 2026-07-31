# Playbook: Executing a Security Review

## Goal
Audit workspace files for security compliance.

## Prerequisites
- Read [security.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/security.md).

## Steps
1. Verify no secrets exist in committed files.
2. Audit route endpoint files for JWT validation middleware calls.
3. Check SQL scripts for parameterized queries.

## Verification
- Scan packages configuration files.

## Rollback
- compensating security commits.

## Definition of Done
- Code passes security audits.
