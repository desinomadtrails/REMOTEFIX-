# RemoteFix API Specification

**Base URL:** `https://remotefix-api.workers.dev`

---

## Auth Router (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new customer account | None |
| `POST` | `/api/auth/login` | Login with email & password | None |
| `POST` | `/api/auth/refresh` | Rotate & issue new access token | Refresh Token |
| `POST` | `/api/auth/forgot-password` | Request password reset email | None |
| `POST` | `/api/auth/reset-password` | Reset password using token | None |
| `POST` | `/api/auth/oauth-login` | Google & Microsoft OAuth sign-in | None |
| `GET`  | `/api/auth/me` | Fetch authenticated user profile | JWT |
| `POST` | `/api/auth/logout` | Revoke active refresh token | JWT |

---

## Service Request & Guest Bookings (`/api/service-request`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/service-request` | Submit guest booking request | None |
| `GET`  | `/api/service-request/track` | Track request via Ticket ID & Mobile Number | None |

---

## Technician Field Workflow (`/api/technician-workflow`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/technician-workflow/check-in` | Record GPS check-in & start work timer | Engineer / Admin |
| `POST` | `/api/technician-workflow/upload-work-assets` | Upload before/after photos & signature | Engineer / Admin |
| `POST` | `/api/technician-workflow/check-out` | Record GPS check-out & mark completed | Engineer / Admin |
| `GET`  | `/api/technician-workflow/log/:bookingId` | Fetch work log details for a booking | Engineer / Admin |

---

## System & Health (`/health`, `/api/health`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/health` | Live DB connection, latency & uptime | None |
| `GET`  | `/api/health` | Diagnostic status & metrics | None |
| `POST` | `/api/seed` | Seed initial services catalog | Admin |
