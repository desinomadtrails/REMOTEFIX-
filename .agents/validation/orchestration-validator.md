# Orchestration Validator - RemoteFix

## Purpose
Validates AI orchestration parameters.

## Scope
Applies to all files under `.agents/orchestration/*.md`.

## Overview
Ensures task routing, context sizes, planning, and failure recovery contain no dead ends.

## Standards
- Verify that every classified task maps to a valid playbook.

## Related Documents
- [compliance.md](file:///e:/SURAJ/REMOTEFIX-/.agents/validation/compliance.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`verify_orchestration.py` (validation runner)
