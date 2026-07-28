# RemoteFix Enterprise Architecture & Topology

## System Overview
RemoteFix is a multi-tenant, zero-friction IT Service Management (ITSM) SaaS platform. It combines serverless cloud microservices, reactive frontend web applications, and an enterprise Azure SQL database.

```
                     ┌───────────────────────────────────────────────────────────┐
                     │                 RemoteFix Client Applications             │
                     └─────────────────────────────┬─────────────────────────────┘
                                                   │
                       ┌───────────────────────────┴───────────────────────────┐
                       │                                                       │
                       ▼                                                       ▼
       ┌───────────────────────────────┐                       ┌───────────────────────────────┐
       │   Customer Portal & Web App   │                       │      Admin & Tech Suite       │
       │     (React 19 + Vite)         │                       │     (React 19 + Vite)         │
       └───────────────┬───────────────┘                       └───────────────┬───────────────┘
                       │                                                       │
                       └───────────────────────────┬───────────────────────────┘
                                                   │ HTTPS / REST (JWT & CORS)
                                                   ▼
                     ┌───────────────────────────────────────────────────────────┐
                     │               Hono API Gateway Microservice               │
                     │          (Deployed on Cloudflare Workers Serverless)      │
                     └─────────────────────────────┬─────────────────────────────┘
                                                   │
        ┌──────────────────────────────────────────┼──────────────────────────────────────────┐
        │                                          │                                          │
        ▼                                          ▼                                          ▼
┌───────────────┐                          ┌───────────────┐                          ┌───────────────┐
│ Azure SQL DB  │                          │  Email / SMS  │                          │ Object Storage│
│ (Drizzle ORM) │                          │ (SMTP/Twilio) │                          │(R2 / Azure OS)│
└───────────────┘                          └───────────────┘                          └───────────────┘
```

---

## Shared Workspace Architecture

```
remotefix/
├── apps/
│   ├── web/               ← Customer-facing website & guest booking portal
│   ├── admin/             ← Admin control suite & technician dispatch portal
│   └── api/               ← Serverless API Gateway (Hono + Cloudflare Workers)
└── packages/
    ├── database/          ← Azure SQL schema, Drizzle ORM models, indexes
    ├── types/             ← Shared Zod validation schemas & TypeScript interfaces
    ├── ui/                ← Shared component design system (Tailwind v4)
    ├── utils/             ← Shared formatting & calculation utilities
    └── auth/              ← PBKDF2 hashing, JWT signing/verifying, token helpers
```

---

## Security Architecture

1. **Authentication:** Dual-token JWT architecture (Short-lived 1-hour Access Tokens + Long-lived 30-day Refresh Tokens with SHA-256 token rotation).
2. **Authorization:** Role-Based Access Control (`admin`, `engineer`, `customer`). Admin role possesses absolute override capabilities.
3. **Data Protection:** All passwords hashed via PBKDF2 with SHA-256 salt iterations. Remote diagnostic sessions protected with AES-256 encryption.
4. **Network & Headers:** Hardened Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), nosniff, XSS protection, and per-route rate limiting.
