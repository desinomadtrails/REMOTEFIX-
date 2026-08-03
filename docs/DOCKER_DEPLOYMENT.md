# RemoteFix Production Docker Deployment Guide (v1.0.1)

## Overview & Architecture

RemoteFix Enterprise API Engine is containerized using a lightweight, multi-stage Alpine Node.js 20 production runtime.

```
┌──────────────────────────────────────────────────────────────┐
│                    Stage 1: Builder                          │
│  Base: node:20-alpine                                        │
│  - Copies root workspace, packages, and apps                 │
│  - Executes `npm ci`                                         │
│  - Builds packages (@remotefix/*) and compiles API engine    │
│    into `apps/api/dist/`                                     │
└──────────────────────────────┬───────────────────────────────┘
                               │ Copies artifacts & packages
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    Stage 2: Runner                           │
│  Base: node:20-alpine (Production Runtime)                   │
│  - Minimal workspace layout                                  │
│  - Pre-built packages + compiled JS (`dist/server.js`)       │
│  - NODE_ENV=production                                       │
│  - Native execution via `node dist/server.js`                │
└──────────────────────────────────────────────────────────────┘
```

## Production Technical Specifications

| Property | Details |
| --- | --- |
| **Base Image** | `node:20-alpine` |
| **Exposed Ports** | `8787` |
| **Working Directory** | `/app/apps/api` |
| **Start Command** | `node dist/server.js` |
| **Container User** | `node` / root |
| **Target Build Output** | `apps/api/dist/` |

---

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | Yes | `production` | Environment mode |
| `PORT` | Yes | `8787` | Application HTTP port |
| `HOST` | No | `0.0.0.0` | Host binding address |
| `DATABASE_URL` | Yes | - | Azure SQL / MSSQL Connection string |
| `JWT_SECRET` | Yes | - | Secret key for JWT signing & verification |
| `AZURE_STORAGE_CONNECTION_STRING` | Optional | - | Connection string for Azure Blob Storage |

---

## Startup & Build Procedure

### 1. Build Production Image

To build the standalone Docker image locally or in CI/CD:

```bash
docker build -t remotefix-api:v1.0.1 -t remotefix-api:latest .
```

### 2. Run via Docker Compose

To deploy using Docker Compose:

```bash
docker compose build --no-cache
docker compose up -d
```

### 3. Verify Health Endpoints

Confirm operational readiness by querying the health endpoints:

```bash
# General Health Check
curl -f http://localhost:8787/health

# API Subpath Health Check
curl -f http://localhost:8787/api/health

# Kubernetes Liveness Probe
curl -f http://localhost:8787/health/liveness
```

---

## Deployment Instructions

1. **Pre-flight Checks**:
   - Ensure target server has Docker Engine 20.10+ and Docker Compose v2+.
   - Verify environment variables (`DATABASE_URL`, `JWT_SECRET`) are configured in `.env` or system environment.

2. **Container Launch**:
   ```bash
   docker compose up -d --build
   ```

3. **Post-Deployment Verification**:
   ```bash
   docker compose ps
   docker compose logs -f remotefix-api
   ```

---

## Rollback Procedure

If a failure occurs during production release:

1. **Revert to Previous Tag**:
   ```bash
   docker compose down
   docker tag remotefix-api:v1.0.0 remotefix-api:latest
   docker compose up -d
   ```

2. **Emergency Hotfix Rollback**:
   ```bash
   git checkout HEAD~1
   docker compose up -d --build
   ```
