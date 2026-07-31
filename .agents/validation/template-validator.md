# Template Validator - RemoteFix

## Purpose
Enforces layout standards on all engineering assets templates.

## Scope
Applies to all files under `.agents/templates/*.md`.

## Overview
Ensures templates contain the required 6 sections (Purpose, When to use, Required inputs, Example, Common mistakes, Checklist).

## Standards
- Verify template examples compile under strict TypeScript compiler rules.

## Examples
*Header check sequence:*
`assert all(h in content for h in ["## Purpose", "## When to use", "## Required inputs", "## Example", "## Common mistakes", "## Checklist"])`

## Related Documents
- [compliance.md](file:///e:/SURAJ/REMOTEFIX-/.agents/validation/compliance.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`verify_assets.py` (validation runner)
