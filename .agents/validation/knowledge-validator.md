# Knowledge Base Validator - RemoteFix

## Purpose
Ensures all knowledge files match the 9 metadata headers.

## Scope
Applies to all files under `.agents/knowledge/` (including `adr/` and `integrations/`).

## Overview
Validates that knowledge base references contain Purpose, Scope, Overview, Standards, Examples, Related Documents, Status, Last Updated, and Source of Truth.

## Standards
- Missing headers are treated as compilation failures.

## Related Documents
- [compliance.md](file:///e:/SURAJ/REMOTEFIX-/.agents/validation/compliance.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`verify_refactored_knowledge.py` (validation runner)
