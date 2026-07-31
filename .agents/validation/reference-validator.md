# Reference Link Validator - RemoteFix

## Purpose
Ensures all markdown cross-references are valid and unbroken.

## Scope
Applies to all `.md` files in the `.agents/` workspace.

## Overview
Prevents broken relative path references by checking every `file:///` scheme link.

## Standards
- Every link matching the `file:///` schema must resolve to an existing workspace file.
- Checks must validate that no link targets use backslashes.

## Examples
*Link parsing regex:*
`\[.*?\]\(file:///(.*?)\)`

## Related Documents
- [compliance.md](file:///e:/SURAJ/REMOTEFIX-/.agents/validation/compliance.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`tsconfig.json` (paths maps)
