# Playbook: Production Release

## Goal
Build and release applications to Azure Web Apps.

## Prerequisites
- Checked [pre-release.md](file:///e:/SURAJ/REMOTEFIX-/.agents/checks/pre-release.md).

## Steps
1. Commit branch changes and merge into `main`.
2. Ensure GitHub Actions pipeline completes building tasks.
3. Validate Azure Web Apps logs.

## Verification
- Check public gateway URLs.

## Rollback
- Revert deploy slots inside Azure Portal.

## Definition of Done
- Release publishes successfully.
