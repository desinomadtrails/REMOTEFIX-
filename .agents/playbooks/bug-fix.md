# Playbook: Executing a Bug Fix

## Goal
Diagnose and resolve code failures safely.

## Prerequisites
- Error reports or console logs available.

## Steps
1. Locate the failing code path.
2. Verify local compilation states.
3. Apply **LEAN CODE FIRST** evaluation: check if the bug can be solved by simplifying/removing code or reusing existing libraries/code before writing new custom code.
4. Apply focused patches matching rules.
5. Run tests to check for regressions.

## Verification
- Run `npm run test` and check logging telemetry.

## Rollback
- Run `git checkout -- <file>` to undo changes.

## Definition of Done
- Bug resolves and tests pass.
