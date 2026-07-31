# Azure Cloud Integrations - RemoteFix

## Purpose
Manage SQL storage and blob uploads for proof-of-work images.

## Scope
Applies to Azure SQL DB and Azure Blob Storage clients.

## Overview
Azure handles the relational database layer and static image uploads for engineer proof-of-work.

## Standards
- **SQL Security**: SQL connections must enforce TLS encryption (`Encrypt=true`).
- **Blob Uploads**: Upload images to the `booking-images` container via `fetch` using SAS Token URLs.

## Examples
*Blob storage upload call:*
```typescript
const url = `https://${accountName}.blob.core.windows.net/${container}/${fileName}?${sasToken}`;
```

## Related Documents
- [database.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/database.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`apps/api/src/azureStorage.ts`
