# Playbook Validator - RemoteFix

## Purpose
Validates playbook structures.

## Scope
Applies to all files under `.agents/playbooks/*.md`.

## Overview
Ensures playbooks contain Goal, Prerequisites, Steps, Verification, Rollback, and Definition of Done.

## Standards
- Rollback steps must be verified for feasibility.

## Related Documents
- [compliance.md](file:///e:/SURAJ/REMOTEFIX-/.agents/validation/compliance.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`verify_assets.py` (validation runner)
