# RemoteFix Master Architecture & Project Bible

**Author**: Lead Solutions Architect & Engineering Audit Practice  
**Target Repository**: `desinomadtrails/REMOTEFIX-`  
**Execution Timestamp**: 2026-08-07T14:45:00Z  
**Verification Standard**: Zero Fabrication Policy & Source Code AST Evidence  

---

## 1. Project Overview & Business Purpose

RemoteFix is an Enterprise IT Service Management (ITSM), Field Service Management (FSM), Asset Management (ITAM), Customer Support, and AI Operations SaaS platform built as a high-performance NPM Workspaces monorepo.

### Core Domain Capabilities
1. **Field Service Management (FSM)**: Real-time technician booking, dispatch, GPS tracking, and work order approval workflows ([apps/api/src/routes/bookings.ts](file:///e:/SURAJ/REMOTEFIX-/apps/api/src/routes/bookings.ts)).
2. **IT Asset Management (ITAM)**: Hardware asset tracking, QR code generation, warranty tracking, and device diagnostics ([packages/database/database/schema/index.ts:L76-L98](file:///e:/SURAJ/REMOTEFIX-/packages/database/database/schema/index.ts#L76-L98)).
3. **AI Triage & Operations Engine**: Automated NLP ticket classification, root cause analysis, fix proposal generation, and sandboxed execution ([apps/api/src/services/ai/](file:///e:/SURAJ/REMOTEFIX-/apps/api/src/services/ai/)).
4. **Multi-Tenant Administration**: Enterprise role-based access control (RBAC), multi-tenant department routing, SLA management, and billing ([apps/admin/src/pages/](file:///e:/SURAJ/REMOTEFIX-/apps/admin/src/pages/)).

---

## 2. Monorepo Workspaces & Architecture

```
                                    ┌────────────────────────┐
                                    │   apps/web (SPA)       │ (React 19, Vite 6)
                                    └───────────┬────────────┘
                                                │
┌────────────────────────┐          ┌───────────▼────────────┐
│   apps/admin (Console) │─────────►│    apps/api (REST)     │ (Hono 4, Zod)
└────────────────────────┘          └───────────┬────────────┘
                                                │
                                    ┌───────────▼────────────┐
                                    │   packages/database    │ (Drizzle ORM)
                                    └───────────┬────────────┘
                                                │
                                    ┌───────────▼────────────┐
                                    │   Azure SQL Database   │
                                    └────────────────────────┘
```

### Workspace Directory Layout

| Directory | Package / Service | Role & Responsibility | Primary Source File |
| :--- | :--- | :--- | :--- |
| `apps/web` | `web@1.0.0` | Customer Web Portal & Service Booking | [apps/web/src/App.tsx](file:///e:/SURAJ/REMOTEFIX-/apps/web/src/App.tsx) |
| `apps/api` | `api@1.0.0` | Hono REST API Gateway & Business Engine | [apps/api/src/index.ts](file:///e:/SURAJ/REMOTEFIX-/apps/api/src/index.ts) |
| `apps/admin` | `admin@1.0.0` | Enterprise Operations & Admin Console | [apps/admin/src/App.tsx](file:///e:/SURAJ/REMOTEFIX-/apps/admin/src/App.tsx) |
| `apps/mobile` | `@remotefix/mobile` | Mobile Client Interface | [apps/mobile/src/App.tsx](file:///e:/SURAJ/REMOTEFIX-/apps/mobile/src/App.tsx) |
| `packages/auth` | `@remotefix/auth` | Cryptography, Bcrypt 12, JWT Signing | [packages/auth/src/index.ts](file:///e:/SURAJ/REMOTEFIX-/packages/auth/src/index.ts) |
| `packages/database`| `@remotefix/database` | Drizzle ORM Schema & Azure SQL Pool | [packages/database/database/schema/index.ts](file:///e:/SURAJ/REMOTEFIX-/packages/database/database/schema/index.ts) |
| `packages/types` | `@remotefix/types` | TypeScript Interface & Zod Definitions | [packages/types/src/index.ts](file:///e:/SURAJ/REMOTEFIX-/packages/types/src/index.ts) |
| `packages/ui` | `@remotefix/ui` | Reusable Design System Primitives | [packages/ui/src/index.ts](file:///e:/SURAJ/REMOTEFIX-/packages/ui/src/index.ts) |
| `packages/utils` | `@remotefix/utils` | Date, String, and Formatting Utilities | [packages/utils/src/index.ts](file:///e:/SURAJ/REMOTEFIX-/packages/utils/src/index.ts) |

---

## 3. Technology Stack & Frameworks

- **Frontend Engines**: React 19, React Router 7, Vite 6, Tailwind CSS 4, Lucide React Icons.
- **Backend REST Gateway**: Hono 4 (Edge-ready REST API engine), Zod payload validation, dotenvx secrets management.
- **Database Layer**: Azure SQL Database (`mssql`), Drizzle ORM, T-SQL migration engine.
- **Security Framework**: Bcrypt (12 salt rounds), JWT Bearer tokens with session refresh rotation, SAML 2.0 SSO SP metadata.
- **Testing & Verification**: TypeScript strict mode (`tsc --noEmit`), Vitest integration suites, Playwright headless browser E2E, CycloneDX SBOM.

---

## 4. Key Verification Artifacts

- **Static Typecheck**: Passed 100% (`npm run typecheck`). Log: [`audit-evidence/typecheck.log`](file:///e:/SURAJ/REMOTEFIX-/audit-evidence/typecheck.log)
- **Production Build**: Passed 100% (`npm run build`). Log: [`audit-evidence/build.log`](file:///e:/SURAJ/REMOTEFIX-/audit-evidence/build.log)
- **REST API Suite**: Passed 23/23 assertions (`npm test`). Log: [`audit-evidence/rc_suite.log`](file:///e:/SURAJ/REMOTEFIX-/audit-evidence/rc_suite.log)
- **Software Bill of Materials**: CycloneDX v1.4 ([`audit-evidence/SBOM.json`](file:///e:/SURAJ/REMOTEFIX-/audit-evidence/SBOM.json))
