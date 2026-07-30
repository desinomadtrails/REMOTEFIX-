# RemoteFix Backup & Disaster Recovery Runbook

## Automated & On-Demand Encrypted Backups
- Encrypted AES-256 backup snapshots are stored in Azure SQL storage with SHA-256 checksum verification.
- On-demand backups can be generated via `POST /api/admin/backups/trigger` or via the Admin Settings Console.

## Tenant JSON Data Export & Import
- Export tenant data packs via `GET /api/admin/backups/tenant-export/:orgId`.
- Includes tenant organization details, active user accounts, ITAM assets, and service history.

## Disaster Recovery Verification
- Execute automated restore verification via `POST /api/admin/backups/restore`.
- Verifies checksum integrity and target schema compatibility prior to triggering database restores.
