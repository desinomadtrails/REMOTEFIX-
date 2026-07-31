# Playbook: Dependency Upgrades

## Goal
Upgrade npm package dependencies safely.

## Prerequisites
- Target package identified.

## Steps
1. Update package version mapping in workspace `package.json` files.
2. Execute `npm install` to update lockfiles.
3. Run monorepo typecheck compiling: `npm run typecheck`.

## Verification
- Execute automated integration tests.

## Rollback
- Run `git checkout package-lock.json` and reinstall.

## Definition of Done
- Dependencies update without compilation warnings.
