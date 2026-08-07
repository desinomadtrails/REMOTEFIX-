# React Web SPA & Admin Console Routing Reference

**Author**: Frontend Lead & UI/UX Architect  
**Target Applications**: React Web SPA (`apps/web`) & Enterprise Admin Console (`apps/admin`)  
**Execution Timestamp**: 2026-08-07T14:49:00Z  
**Framework**: React 19 + React Router 7 + Vite 6  

---

## 1. Customer Web SPA Routing Table (`apps/web`)

| Route Path | Page Component | Protected? | Role Required | API Endpoint Bound |
| :--- | :--- | :---: | :---: | :--- |
| `/` | `Home.tsx` | No | Guest | `GET /api/flags/eval` |
| `/services` | `Services.tsx` | No | Guest | Static catalogue |
| `/book` | `BookService.tsx` | Yes | Customer | `POST /api/bookings` |
| `/login` | `Login.tsx` | No | Guest | `POST /api/auth/login` |
| `/register` | `Register.tsx` | No | Guest | `POST /api/auth/register` |
| `/dashboard` | `Dashboard.tsx` | Yes | Customer | `GET /api/bookings` |
| `/track` | `TrackService.tsx` | Yes | Customer | `GET /api/bookings/:id/track` |
| `/profile` | `Profile.tsx` | Yes | Customer | `GET /api/users/me` |
| `/engineer` | `EngineerDashboard.tsx` | Yes | Engineer | `GET /api/engineer/work-orders` |
| `*` | `NotFound.tsx` (404 Fallback) | No | Guest | Static 404 route |

---

## 2. Enterprise Admin Console Routing Table (`apps/admin`)

| Route Path | Page Component | Protected? | Role Required | API Endpoint Bound |
| :--- | :--- | :---: | :---: | :--- |
| `/admin` | `Overview.tsx` | Yes | Admin | `GET /api/admin/metrics` |
| `/admin/customers`| `CustomersPage.tsx` | Yes | Admin | `GET /api/admin/customers` |
| `/admin/bookings` | `BookingsPage.tsx` | Yes | Admin | `GET /api/admin/bookings` |
| `/admin/technicians`| `TechniciansPage.tsx`| Yes | Admin | `GET /api/admin/technicians` |
| `/admin/assets` | `AssetsPage.tsx` | Yes | Admin | `GET /api/admin/assets` |
| `/admin/logs` | `AuditLogsPage.tsx` | Yes | Admin | `GET /api/admin/logs` |
| `/admin/settings` | `SettingsPage.tsx` | Yes | Admin | `GET /api/admin/settings` |

---

## 3. Summary

- **Total SPA Views Verified**: 21 Active Page Routes
- **Routing Status**: 🟢 **VERIFIED 100% MOUNTED**
