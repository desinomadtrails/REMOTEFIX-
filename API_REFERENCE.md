# REST API Endpoint Reference Specification

**Author**: Principal API Architect & Backend Lead  
**Target Gateway**: Hono REST API Core (`apps/api`)  
**Execution Timestamp**: 2026-08-07T14:48:00Z  
**OpenAPI Specification**: 3.1.0 (`GET /api/docs/openapi.json`)  

---

## 1. System Health & Observability Endpoints

### `GET /health`
- **Purpose**: System health check probe.
- **Authentication**: Public.
- **Response**: `200 OK` (`{"status": "healthy"}`).
- **Source File**: [apps/api/src/routes/health.ts:L12](file:///e:/SURAJ/REMOTEFIX-/apps/api/src/routes/health.ts#L12).

### `GET /health/liveness`
- **Purpose**: Kubernetes / Render container liveness probe.
- **Authentication**: Public.
- **Response**: `200 OK` (`{"status": "alive"}`).
- **Source File**: [apps/api/src/routes/health.ts:L24](file:///e:/SURAJ/REMOTEFIX-/apps/api/src/routes/health.ts#L24).

### `GET /metrics`
- **Purpose**: Prometheus metrics telemetry exporter.
- **Authentication**: Public.
- **Response**: `200 OK` (`text/plain`).
- **Source File**: [apps/api/src/routes/health.ts:L35](file:///e:/SURAJ/REMOTEFIX-/apps/api/src/routes/health.ts#L35).

---

## 2. Authentication & Identity Endpoints

### `POST /api/auth/register`
- **Purpose**: Customer & Engineer registration.
- **Authentication**: Public.
- **Payload Validation**: `Zod` (`email`, `password`, `name`, `role`).
- **Response**: `201 Created` (`{"token": "...", "user": {...}}`).
- **Source File**: [apps/api/src/routes/auth.ts:L28](file:///e:/SURAJ/REMOTEFIX-/apps/api/src/routes/auth.ts#L28).

### `POST /api/auth/login`
- **Purpose**: Local password authentication.
- **Authentication**: Public.
- **Payload Validation**: `Zod` (`email`, `password`).
- **Response**: `200 OK` (`{"token": "...", "refreshToken": "..."}`).
- **Source File**: [apps/api/src/routes/auth.ts:L65](file:///e:/SURAJ/REMOTEFIX-/apps/api/src/routes/auth.ts#L65).

### `POST /api/auth/refresh`
- **Purpose**: JWT access token refresh rotation.
- **Authentication**: JWT Bearer.
- **Response**: `200 OK` (`{"token": "..."}`).
- **Source File**: [apps/api/src/routes/auth.ts:L112](file:///e:/SURAJ/REMOTEFIX-/apps/api/src/routes/auth.ts#L112).

### `GET /api/auth/sso/metadata`
- **Purpose**: SAML 2.0 Service Provider Metadata XML.
- **Authentication**: Public.
- **Response**: `200 OK` (`application/xml`).
- **Source File**: [apps/api/src/routes/auth.ts:L145](file:///e:/SURAJ/REMOTEFIX-/apps/api/src/routes/auth.ts#L145).

---

## 3. Service Desk & AI Operations Endpoints

### `POST /api/ai/triage`
- **Purpose**: AI ticket triage & NLP classification.
- **Authentication**: JWT Bearer.
- **Response**: `200 OK` (`{"triage": {"category": "Hardware", "priority": "High"}}`).
- **Source File**: [apps/api/src/routes/projects.ts:L1150](file:///e:/SURAJ/REMOTEFIX-/apps/api/src/routes/projects.ts#L1150).

### `POST /api/projects/:id/run`
- **Purpose**: End-to-end AI project planning, implementation, and verification workflow.
- **Authentication**: JWT Bearer.
- **Response**: `200 OK` (`{"status": "completed", "workflow": {...}}`).
- **Source File**: [apps/api/src/routes/projects.ts:L1497](file:///e:/SURAJ/REMOTEFIX-/apps/api/src/routes/projects.ts#L1497).
