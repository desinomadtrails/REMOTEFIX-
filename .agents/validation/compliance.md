# Framework Compliance - RemoteFix

## Purpose
Verifies overall framework compliance.

## Scope
Applies to all files under `.agents/`.

## Overview
Aggregates reports from structural, link, and schema validators.

## Standards
- Run compliance checks via custom verification scripts.
- Verify Lean Code Compliance (no duplicate implementations, no unnecessary files, no dead code, no duplicate utilities, minimal abstractions).
- Run Wrapper Justification Validation: reject wrapper classes that provide no additional engineering behavior.

## Related Documents
- [quality-gates.md](file:///e:/SURAJ/REMOTEFIX-/.agents/validation/quality-gates.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`package.json`
