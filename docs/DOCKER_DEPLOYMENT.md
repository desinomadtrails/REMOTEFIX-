# RemoteFix Production Docker Deployment Guide (v1.0.2)

## Overview & Architecture

RemoteFix Enterprise API Engine is containerized using a lightweight, multi-stage Alpine Node.js 20 production runtime adhering to the **Docker Compose Specification**.

```
┌──────────────────────────────────────────────────────────────┐
│                    Stage 1: Builder                          │
│  Base: node:20-alpine                                        │
│  - Copies root workspace, packages, tsconfig, and apps       │
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

---

## Production Technical Specifications

| Property | Details |
| --- | --- |
| **Specification** | Docker Compose Specification (Warning-free, top-level `services`) |
| **Base Image** | `node:20-alpine` |
| **Exposed Ports** | `8787` |
| **Working Directory** | `/app/apps/api` |
| **Start Command** | `node dist/server.js` |
| **Container Image Size** | ~185 MB (compressed) / ~964 MB (unpacked) |
| **Boot Startup Time** | < 1.0 second |

---

## Health Endpoints & Probes

RemoteFix separates **Liveness** (container execution status) from **Readiness** (dependency availability):

| Endpoint | HTTP Status | Role & Behavior |
| --- | --- | --- |
| `GET /health/liveness` | `200 OK` | **Liveness Probe**: Immediately returns `{"status":"alive"}`. Never relies on external services, database pools, or remote networks. Used by Docker Compose and K8s liveness probes. |
| `GET /health` | `200 OK` / `503 Service Unavailable` | **General Health Check**: Checks gateway status and database pool readiness. |
| `GET /api/health` | `200 OK` / `503 Service Unavailable` | **API Subpath Health Check**: Identical to `/health` under the `/api` route prefix. |

### Database Readiness Configuration

- **Default / Unconfigured Mode (`DATABASE_URL=""` or omitted)**:
  `checks.database.status` returns `"not_configured"`. RemoteFix operates as a standalone gateway and returns **HTTP 200 OK (`healthy`)**.
- **Configured Mode (`DATABASE_URL="sqlserver://..."`)**:
  The health handler executes an active ping query (`SELECT 1 as ping`).
  - **Successful Ping**: Returns **HTTP 200 OK** (`checks.database.status = "connected"`).
  - **Connection Failure**: Returns **HTTP 503 Service Unavailable** (`checks.database.status = "error"`).

---

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | Yes | `production` | Environment mode (`production` / `development`) |
| `PORT` | Yes | `8787` | Application HTTP port |
| `HOST` | No | `0.0.0.0` | Network interface binding |
| `DATABASE_URL` | Optional | `""` | Azure SQL / MSSQL Connection string. When omitted, healthcheck defaults to `not_configured`. |
| `JWT_SECRET` | Yes | - | Secret key for JWT signing & verification |
| `AZURE_STORAGE_CONNECTION_STRING` | Optional | `""` | Connection string for Azure Blob Storage |

---

## Startup & Build Procedure

### 1. Validate Docker Compose Specification

Verify that the Compose file is warning-free:

```bash
docker compose config
```

### 2. Build Production Image

To build the multi-stage production Docker image:

```bash
docker build -t remotefix-api:v1.0.2 -t remotefix-api:latest .
```

### 3. Deploy via Docker Compose

```bash
# Clean launch
docker compose down
docker compose up -d --build

# Verify container health and logs
docker compose ps
docker compose logs --tail=50
```

### 4. Verify Health Endpoints

```bash
# Liveness Probe (Returns HTTP 200)
curl -i http://localhost:8787/health/liveness

# Gateway Health Check (Returns HTTP 200)
curl -i http://localhost:8787/health

# API Health Check (Returns HTTP 200)
curl -i http://localhost:8787/api/health
```

---

## Common Troubleshooting & Known Issues

### 1. Container Unhealthy in `docker compose ps`
- **Cause**: Using `localhost` in Alpine containers may resolve to IPv6 (`::1`), whereas Node binds to IPv4 (`0.0.0.0`).
- **Fix**: The Compose file specifies `http://127.0.0.1:8787/health/liveness` for container healthcheck execution.

### 2. Known Windows PowerShell `PSReadLine` Paste Crash
- **Symptom**: Pasting long text or pressing `Ctrl+V` in Windows PowerShell causes the PowerShell terminal window to crash or freeze.
- **Root Cause**: This is a known Windows PowerShell / `PSReadLine` module issue (`PSReadLine` handling of multi-line clipboard buffers) and is completely **unrelated** to Docker or RemoteFix.
- **Workaround**: Right-click to paste in PowerShell, use CMD / Git Bash, or update the module via `Update-Module PSReadLine`.

---

## Rollback Procedure

If a failure occurs during production release:

```bash
# Revert to previous release tag
docker compose down
docker tag remotefix-api:v1.0.1 remotefix-api:latest
docker compose up -d
```
