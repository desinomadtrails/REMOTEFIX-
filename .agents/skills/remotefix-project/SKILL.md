---
name: RemoteFix Product Engineering
description: Implements features and rules corresponding to RemoteFix SaaS business domains.
---

# RemoteFix Product Engineering Skill

## Purpose
Align software implementation with RemoteFix IT SaaS workflows (bookings, tickets, SLA dispatches).

## Scope
Feature components, workflows, scheduling forms under `apps/` and schemas under `packages/database`.

## Responsibilities
- Implement lifecycle transitions (e.g., booked -> dispatched).
- Manage SLA timers and work-proof uploads.

## Decision Rules
- **Rule**: Any status change must trigger corresponding audit logs entry.

## Best Practices
- Refer to [product.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/product.md).
- Use centralized enums for bookings status parameters.

## Common Mistakes
- Hardcoding booking statuses or invoice calculations in client-side code.

## Completion Checklist
- `[ ]` State transition validates against database schemas constraints.
