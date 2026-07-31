# RemoteFix Enterprise Platform Engineering
## Developer Contribution & Engineering Standards (Version 2.0)

> Official engineering handbook, repository standards, coding conventions, development workflows, and onboarding guidelines for the RemoteFix Platform.

---

## 1. Engineering Philosophy

The RemoteFix Platform operates on eight foundational engineering principles to ensure maintainable software, developer experience, and system safety.

```
+-----------------------------------------------------------------------------------+
|                            CORE ENGINEERING PHILOSOPHY                            |
+-------------------+-------------------+--------------------+----------------------+
| 1. Customer First | 2. Security First | 3. API First       | 4. AI First          |
|    Solve Real Pain|    Zero Trust Dev |    REST Standards  |    Predictive/Agents |
+-------------------+-------------------+--------------------+----------------------+
| 5. Doc First      | 6. Quality First  | 7. Automation First| 8. Dev Experience    |
|    ADR & PRD Logs |    TDD & Testing  |    CI/CD Pipelines |    Fast Build Loops  |
+-------------------+-------------------+--------------------+----------------------+
```

- **Customer First**: Write code that solves operational friction for users (customers, dispatchers, technicians).
- **Security First**: Security controls must be baked directly into the design phase. No features are deployed without RBAC and tenant isolation filters.
- **API First**: Expose clean REST endpoints before constructing user interfaces.
- **AI First**: Leverage automated agents, workflows, and predictive scoring to replace manual, reactive operations.
- **Documentation First**: Maintain up-to-date documentation. Architectural changes require an Architecture Decision Record (ADR) update.
- **Quality First**: Software must pass static checks, lint gates, typechecks, and automated tests.
- **Automation First**: Automate testing, vulnerability scanning, Docker building, and container deployments.
- **Developer Experience**: Keep monorepo build times short, tests fast, and dependencies decoupled to enable quick local iterations.

---

## 2. Repository Structure

RemoteFix is organized as a modular, type-safe NPM workspace monorepo.

```
remotefix/
├── apps/                         # Executable Applications
│   ├── admin/                    # Admin Control Suite (React + Vite)
│   ├── api/                      # Edge Hono API Gateway (Cloudflare Workers)
│   ├── mobile/                   # Field Engineer App (React Native)
│   └── web/                      # Public Customer Portal (React + Vite)
├── packages/                     # Shared Monorepo Packages
│   ├── auth/                     # JWT Tokens & Web Crypto Utilities
│   ├── database/                 # Drizzle ORM Schema, Migrations & Connection Pools
│   ├── types/                    # Zod Schema Validators
│   ├── ui/                       # TailwindCSS v4 Shared Components
│   └── utils/                    # Shared Currency & Date Formatters
├── docs/                         # Architecture, Product, Security & API Docs
├── scripts/                      # DB Seeding, Backups & Verification Tools
├── tests/                        # Release Candidate & Phase-specific Test Suites
├── package.json                  # Root Monorepo Configuration
└── tsconfig.json                 # Base Compiler Options
```

### Folder Responsibilities
- **`apps/`**: Self-contained frontend and backend deployments compiling to static assets or V8 isolates.
- **`packages/`**: Decoupled, reusable packages imported natively by application dependencies.
- **`docs/`**: Central repository for platform specifications, PRDs, API guides, and security handbooks.
- **`scripts/`**: Utility automation scripts for database push, seeding, and platform verification.
- **`tests/`**: Integration test suites verifying platform health prior to release.

---

## 3. Architecture Principles

RemoteFix enforces a modular layered architecture to ensure separation of concerns and scaling resilience.

```
UI & Mobile Apps (apps/web, apps/admin, apps/mobile)
   ↓
API Layer (Hono Edge Gateway, Middlewares)
   ↓
Service Layer (Business Logic Services: AI, Billing, Scheduling)
   ↓
Repository Layer (@remotefix/database - SQL Query Builders)
   ↓
Database Dialect (Azure SQL Database)
```

- **Domain-Driven Design (DDD)**: Group code modules by distinct business domains (e.g. Identity, Tickets, Assets, Billing, AI).
- **Modular Monolith**: Code packages execute in a single monorepo but maintain strict imports, ensuring microservice readiness if scale dictates decoupling.
- **Separation of Concerns**: UI components handle only presentation; API gateways manage routing and authorization; Services execute business logic; Repositories build SQL queries.
- **SOLID & Clean Architecture**: Code design follows single-responsibility and dependency inversion. High-level business logic is protected from database schema modifications.

---

## 4. Coding Standards (TypeScript)

All TypeScript codebase elements must conform to strict compiler rules and standardized conventions.

### TypeScript Conventions

- **Naming Conventions**:
  - Classes & Interfaces: `PascalCase` (e.g., `EnterprisePredictiveEngine`).
  - Functions & Variables: `camelCase` (e.g., `calculateHealthScore`).
  - Constants & Enums: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_ROLE_PERMISSIONS`).
  - Files: `camelCase` (e.g., `predictiveEngine.ts`) or `PascalCase` for React components.
- **Imports**: Group imports cleanly: third-party dependencies first, shared packages next, local files last. Use absolute workspace imports (e.g. `@remotefix/auth`) over relative imports.
- **Constants & Enums**: Avoid raw values. Group configuration parameters into read-only constant objects or TypeScript enums.
- **Interfaces**: Prioritize explicit interfaces for function signatures and payload schemas. Avoid `any` types; utilize strict Zod type inferences where possible.
- **Error Classes**: Extend native `Error` classes to throw custom exception objects containing error codes and metadata payload structures.
- **Comments & Docstrings**: Utilize JSDoc style comments on public classes and function declarations, detailing parameter inputs, return types, and exception behaviors.

---

## 5. Backend Development

Backend routes and logic reside within `apps/api/` and `packages/` workspaces.

- **Controllers / Route Handlers**: Handle HTTP request extraction and map status responses. Keep handlers lean; delegate business workflows to services.
- **Service Layer**: House all business rules, calculations, and external integrations (e.g., `EnterprisePredictiveEngine`).
- **Repository Layer**: Construct database queries via Drizzle. Enforce strict `tenantId` SQL scoping.
- **Middleware**: Intercept requests for cross-cutting concerns (`requireAuth`, `requireRole`, rate limiters, distributed tracing).
- **Validation**: Enforce Zod schemas on incoming payloads.
- **Error Handling**: Catch database and service exceptions. Log detailed stack traces internally while returning safe JSON error envelopes to clients.

---

## 6. Frontend Development

Frontend portals are built using React 19 and Vite 6.

- **Component Design**: Build modular, stateless presentation components. TailwindCSS v4 handles styling using design tokens.
- **Hooks**: Use custom React hooks (e.g., `useAuth`, `useTicketQuery`) to isolate data fetching and portal state from presentation layouts.
- **State Management**: Leverage TanStack React Query for server state caching and React Context for local layout state.
- **Forms**: Use React Hook Form with Zod resolver validations.
- **Routing**: Manage routing guards based on user authorization roles.
- **Accessibility**: Ensure form inputs use descriptive labels, buttons utilize aria-attributes, and semantic HTML is preserved.

---

## 7. Mobile Development

The mobile app (`apps/mobile`) is built using React Native, targeting iOS and Android platforms.

- **Offline First**: Support offline work-order inspection using local SQLite or AsyncStorage caches.
- **Synchronization**: Sync offline changes back to the API database when network connectivity is restored.
- **Hardware Integration**:
  - **Camera**: Retrieve photos for diagnostic proof-of-work uploads.
  - **GPS**: Capture technician coordinates for proximity scheduling checks.
  - **QR Scanner**: Scan asset tags for identification.
- **Push Notifications**: Listen for worker-dispatched job assignments.

---

## 8. AI Development

AI services are maintained in `apps/api/src/services/ai/`.

- **Prompt Design**: Manage versioned prompt templates in `PromptRegistry`. System prompts must enforce agent boundaries.
- **Tool Registry**: Implement new capabilities in `EnterpriseToolRegistry`. Every tool definition requires permission checks and input validation.
- **Memory & RAG**: Access session context via `EnterpriseMemoryManager` and query documentation via `EnterpriseRAGEngine` with citations.
- **Agent Governance**: Ensure agents adhere to step limits and token budgets in `AgentGovernanceEngine`.
- **Evaluation**: Run test scripts to evaluate model outputs and confirm tool invocation accuracy before merging prompt changes.

---

## 9. Database Standards

RemoteFix utilizes Microsoft Azure SQL Database managed via Drizzle ORM.

- **Drizzle Kit**: Manage database schema updates using Drizzle migrations (`npm run db:generate`).
- **Migration Policy**: Only additive migrations are allowed in production environments. Never drop columns or rename active tables without a transition plan.
- **Naming Conventions**: Database tables use `camelCase` or `snake_case` consistent with `@remotefix/database` schema standards.
- **Indexes**: Apply non-clustered indexes on search lookup columns (e.g., `tenantId`, `userId`, `status`, `createdAt`).
- **Transactions**: Wrap multi-row database updates in SQL transactions to preserve ACID compliance.
- **Tenant Isolation**: Bind `tenantId` to all query scopes, preventing data leakage across customer environments.

---

## 10. API Development

RemoteFix APIs follow REST guidelines.

- **Payload Envelopes**: All routes return standard JSON envelopes containing `success`, `data`, and `metadata` correlation attributes.
- **Validation**: Enforce schema verification using Zod middleware.
- **Pagination**: Implement limits (`?limit=25`) and offsets on collection routes.
- **Versioning**: Prefix routes with version tags (e.g., `/api/v1/*`).
- **OpenAPI**: Expose specifications at `/api/docs/openapi.json` for interactive Swagger UI rendering.

---

## 11. Testing Standards

Every feature modification requires test coverage before deployment.

- **Unit Tests**: Test utility functions and isolated business services.
- **Integration Tests**: Verify end-to-end service execution (e.g., `tests/phase8_step7.test.ts`).
- **API Tests**: Make HTTP mock requests using Hono's test client to verify response statuses and envelopes.
- **Testing Verification Command**: Run the test suite:
  ```bash
  npm run test
  ```

---

## 12. Git Workflow

RemoteFix uses a structured feature branching strategy.

```
main (Protected)
  ↑
Pull Request & Code Review (Approval Required)
  ↑
feature/phase-X-step-Y (Local Branch)
```

- **Branch Naming**: Prefix branches with purpose: `feature/phase-X-step-Y` or `fix/ticket-id`.
- **Commit Messages**: Format commit logs:
  - `feat: Add predictive inventory forecasting engine`
  - `fix: Resolve ticket assignment race condition`
  - `docs: Update API integration guidelines`
- **Pull Requests & Review**: PRs require clean static checks (lint, typecheck, build) and review approvals from at least one Tech Lead.
- **Merge Policy**: Enforce squash-merge commits to keep the git history clean.

---

## 13. CI/CD Standards

The CI/CD pipeline automates verification steps:

```
Git Push → Lint Check → Typecheck → Test Suite → Security Scan → Build → Image Push → Deployment → Smoke Tests
```

- **Quality Gates**: Failure at lint, typecheck, or test stages halts the deployment pipeline immediately.
- **Security Scans**: Scans for vulnerabilities in dependency versions and container images.
- **Rollback Policy**: Automated deployment monitoring triggers rollbacks to the last stable release tag if post-deployment error rates spike.

---

## 14. Performance Guidelines

Ensure system latency and resource utilization remain optimized:

- **Database Performance**: Use pagination for large datasets and avoid N+1 queries by leveraging SQL joins.
- **Caching Strategy**: Cache static catalogs and frequently evaluated feature flags in Redis.
- **AI Optimization**: Use the AI prompt cache (`AiCache`) to reduce redundant LLM calls.
- **Background Processing**: Delegate long-running tasks to async queues to keep Edge API threads responsive.

---

## 15. Observability

Observability tracks performance metrics and errors:

- **Structured Logging**: Log request correlation IDs (`requestId`) in structured JSON.
- **Prometheus Metrics**: Expose rate, error, and duration (RED) metrics.
- **Tracing**: Track request lifecycles across services using correlation headers (`X-Request-ID`).
- **Health Checks**: Access `/health` and `/health/liveness` for container routing.

---

## 16. Security Requirements

- **Secrets Management**: Runtime variables must be read from environment configurations or Key Vaults.
- **RBAC Guards**: Secure administrative routes using `requireRole` middleware.
- **Tenant Validation**: Enforce `tenantId` checks on all resource accesses.
- **Encryption**: Enforce TLS 1.3 in-transit and AES-256 at-rest.
- **Audit Logging**: Record state mutations in the database audit log.

---

## 17. Documentation Requirements

- **API Documentation**: Maintain the OpenAPI specification alongside changes.
- **Architecture Documentation**: Document structural modifications in the [Microservices Architecture Guide](file:///e:/SURAJ/REMOTEFIX-/docs/architecture/MICROSERVICES_DEPLOYMENT_ARCHITECTURE.md).
- **Code Comments**: Add JSDoc comments to public APIs and core business logic.
- **Release Notes**: Document modifications in release logs.

---

## 18. Engineering Principles

```
1. Keep It Simple (KISS): Prefer readability over complex logic.
2. Code Reusability: Share packages across apps via monorepo packages.
3. Small, Focused Pull Requests: Keep changesets under 400 lines of code.
4. Verify Locally: Run typecheck and tests before pushing to Git.
5. Secure by Default: Deny access unless explicitly authorized.
6. AI Safety: Wrap all agent actions in permission checks and approval policies.
```

---

## 19. Onboarding Checklist

Onboarding workflow for engineers joining the RemoteFix project:

```
[ ] Step 1: Clone Repository & Configure Local Environment (.env)
[ ] Step 2: Install Node.js Dependencies (npm install)
[ ] Step 3: Run Database Warmup Check (npm run db:test)
[ ] Step 4: Verify Local Typechecking (npm run typecheck)
[ ] Step 5: Run Platform Test Suite (npm run test)
[ ] Step 6: Review Product Requirements Document (PRD v2.0)
[ ] Step 7: Review API Design & Integration Guide (v2.0)
[ ] Step 8: Setup Local Ingress Proxy (Wrangler / Local Dev Gateway)
```

---

## 20. Document Metadata

```
+-----------------------------------------------------------------------------------+
|                                DOCUMENT METADATA                                  |
+-------------------+---------------------------------------------------------------+
| Document Name     | RemoteFix Developer Contribution & Engineering Standards      |
| Version           | 2.0                                                           |
| Status            | Official / Approved                                           |
| Owner             | Chief Technology Officer (CTO) & Technical Leads              |
| Last Updated      | July 31, 2026                                                 |
| Target Audience   | Backend, Frontend, Mobile, AI, QA, & DevOps Engineers         |
+-------------------+---------------------------------------------------------------+
```

### Related Platform Architecture Documents

- [Microservices & Cloud Deployment Architecture (v2.0)](file:///e:/SURAJ/REMOTEFIX-/docs/architecture/MICROSERVICES_DEPLOYMENT_ARCHITECTURE.md)
- [Product Requirements Document (PRD v2.0)](file:///e:/SURAJ/REMOTEFIX-/docs/product/PRODUCT_REQUIREMENTS_DOCUMENT.md)
- [API Design & Integration Guide (v2.0)](file:///e:/SURAJ/REMOTEFIX-/docs/architecture/API_DESIGN_AND_INTEGRATION_GUIDE.md)
- [Security & Compliance Handbook (v2.0)](file:///e:/SURAJ/REMOTEFIX-/docs/security/SECURITY_AND_COMPLIANCE_HANDBOOK.md)
