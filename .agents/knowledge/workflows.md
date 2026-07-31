# Execution Workflows & Quality Verification - RemoteFix

## Purpose
Defines the step-by-step pipeline for coding, verifying, and documenting changes.

## Scope
All feature changes and bug fixes.

## Overview
The quality control workflow guarantees that changes are planned, approved, verified, and documented.

## Standards
1. **Plan**: Write proposed edits in the `implementation_plan.md` artifact.
2. **Approval**: Wait for user review and approval.
3. **Execution**: Make changes using native file modifiers (`replace_file_content`).
4. **Verification**: Verify typescript compile (`npm run typecheck`) and runs tests (`npm run test`).
5. **Walkthrough**: Document changes, tests run, and validation results in `walkthrough.md`.

## Examples
*Quality check run sequence:*
`npm run typecheck && npm run test`

## Related Documents
- [devops.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/devops.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`.agents/skills/remotefix-workflow/SKILL.md`
