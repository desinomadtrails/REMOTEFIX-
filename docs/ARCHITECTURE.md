# RemoteFix Enterprise Platform Architecture

## Executive System Overview
RemoteFix is a multi-tenant enterprise IT Service Management (ITSM), Remote Monitoring & Management (RMM), AI Incident Diagnosis, IT Asset Management (ITAM), and Annual Maintenance Contract (AMC) Billing SaaS platform.

```
                  ┌─────────────────────────────────────────┐
                  │   Cloudflare Edge Network / Ingress     │
                  └────────────────────┬────────────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                │                                             │
      ┌─────────▼────────┐                          ┌─────────▼────────┐
      │   apps/web       │                          │   apps/admin     │
      │ (Customer Portal)│                          │ (Admin Console)  │
      └─────────┬────────┘                          └─────────┬────────┘
                │                                             │
                └──────────────────────┬──────────────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │   apps/api (Hono API)       │
                        └──────────────┬──────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        │                              │                              │
┌───────▼────────┐           ┌─────────▼────────┐           ┌─────────▼────────┐
│ Azure SQL DB   │           │ RMM Telemetry    │           │ SAML SSO / Okta  │
│ (Drizzle ORM)  │           │ Endpoint Daemon  │           │ Identity Provider│
└────────────────┘           └──────────────────┘           └──────────────────┘
```

## Workspace Sitemap
- `apps/web`: High-performance customer portal and public booking UI built with Vite, React, Vanilla CSS, and Framer Motion.
- `apps/admin`: Enterprise administrative console featuring Multi-Tenant Tenant Switcher, RBAC Matrix, AI Copilot, ITAM Assets, RMM Console, AMC Contracts, SLA Engine, Audit Logs, Notification Center, Feature Flags, and Disaster Recovery.
- `apps/api`: Edge API microservice built on Hono and Cloudflare Workers runtime.
- `packages/database`: Azure SQL database schema managed via Drizzle ORM.
- `packages/types`: Shared TypeScript interfaces and Zod validation schemas.
- `packages/auth`: JWT authentication, database-driven RBAC checking, and password hashing utilities.
- `packages/ui`: Cyberpunk-themed reusable React design system component library.
- `packages/utils`: Date formatting, currency formatters, and utility functions.
