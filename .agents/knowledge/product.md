# Product Definition & Domain Rules - RemoteFix

## Purpose
Defines the business domains and lifecycle rules for the RemoteFix SaaS platform.

## Scope
Applies to SQL schemas, client wizards, and booking transition routes.

## Overview
RemoteFix tracks organizations, departments, AMC contracts, assets, bookings, SLAs, tickets, and reviews.

## Standards
- **Multi-Tenant**: Users, assets, and bookings must resolve to an `organizationId`.
- **Booking Status**: Follows transitions: `pending` -> `assigned` -> `in_progress` -> `completed` / `cancelled`.
- **Support Tickets**: Follows transitions: `open` -> `in_progress` -> `resolved` -> `closed`.

## Examples
*Technician assignment check:*
```typescript
if (booking.status === "pending" && action.type === "assign") {
  booking.status = "assigned";
  booking.engineerId = action.engineerId;
}
```

## Related Documents
- [database.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/database.md)
- [glossary.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/glossary.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`packages/database/database/schema/index.ts`
