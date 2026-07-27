# RemoteFix — Complete Platform Documentation

> Enterprise SaaS IT Service Management Platform · Built with Hono, React, Drizzle ORM, Azure SQL

---

## Architecture

apps/
  web/            ← Public customer-facing website (React + Vite)
  admin/          ← Admin Control Suite (React + Vite, lazy-split)
  api/            ← Hono API (Cloudflare Workers)
packages/
  database/       ← Drizzle ORM schema + Azure SQL driver
  types/          ← Shared Zod validation schemas
  ui/             ← Shared component library (TailwindCSS v4)
  utils/          ← formatCurrency, formatDateTime helpers
  auth/           ← JWT middleware and role definitions

---

## Security

- Authentication: JWT (HS256, 7-day expiry)
- Authorization: Role-based middleware (requireAuth, requireRole)
- Rate Limiting: Auth: 10 req/min, API: 150 req/min (per-IP bucket)
- Security Headers: X-Frame-Options, CSP, HSTS, nosniff, XSS-Protection, Permissions-Policy
- Audit Logging: All state-change mutations recorded in audit_logs table

---

## Admin Portal Features (11 Tabs)

- Analytics: Revenue KPIs, trend chart, pending incidents, quick actions
- Booking Queue: Search, multi-filter, pagination, bulk actions, engineer assignment
- Customers: CRM list, booking history, invoices, lock/unlock, CSV export
- Technicians: Roster, performance metrics, skills, assigned jobs, CRUD
- Inventory: Stock sheets, low-stock alerts, suppliers, POs, material issues
- Billing: Invoice registry, GST breakdown, printable PDF, payment status
- Reports: Revenue chart, bookings bar chart, status donut, technician leaderboard, CSV export
- Notifications: Activity feed, read/unread state, SMTP/Twilio config
- Settings: Company profile, branding, business hours, service charges, users/roles
- Services: Catalog management, toggle active/inactive
- Audit Logs: Complete security event log

---

## GST Invoice System

Tax Rate: 18% flat (CGST 9% + SGST 9%)
Formula: Base = Amount / 1.18 | GST = Amount - Base
Print: Click Print Invoice >> browser print dialog >> Save as PDF

---

## Testing Credentials

Admin:    admin@remotefix.com     / adminpassword
Engineer: engineer@remotefix.com  / engineerpassword
Customer: Via customer portal registration
