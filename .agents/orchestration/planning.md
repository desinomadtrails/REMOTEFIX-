# Planning Workflow - RemoteFix

## Purpose
Establishes workflow criteria, safety evaluations, and rollback planning based on task sizes.

## Scope
Applies to all planned codebase modifications.

## Overview
Planning ensures that changes are systematically designed and analyzed before implementation.

## Standards

### Task Size Classification
- **Small Task** (e.g. text update, small bug): Requires minimal planning. No formal plan approval required.
- **Medium Task** (e.g. new endpoint, component): Requires an implementation plan. Approval required.
- **Large Feature / Breaking Change**: Requires full implementation plan. Must include a risk analysis and rollback steps.

### Planning Steps
1. **Lean Evaluation**: Prior to any design work, evaluate the following:
   - Is implementation necessary?
   - Does existing architecture already support this feature?
   - Is refactoring preferable to new code?
   - Can custom code be replaced or functions merged?
2. **Research**: Grep codebase to verify dependencies.
3. **Design**: Map schemas and route structures.
4. **Risk Analysis**: Audit for data loss or service downtime risks.
5. **Rollback plan**: Define commands to revert changes if verification fails.

## Examples
*Rollback planning checklist:*
- SQL compensations scripts.
- Git revert target: `git revert <commit-hash>`.

## Related Documents
- [execution.md](file:///e:/SURAJ/REMOTEFIX-/.agents/orchestration/execution.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`FEATURE_VERIFICATION.md` (manual testing steps)
