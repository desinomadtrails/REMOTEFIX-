# RemoteFix Azure SQL Database Schema Specification

## Database Engine
- **Engine:** Azure SQL Database (Serverless / Standard tier)
- **Host:** `your-database.database.windows.net`
- **Database:** `remotefix`

---

## Core Tables Overview

### 1. `users`
- `id` (VARCHAR 36, PK)
- `email` (VARCHAR 255, Unique, Indexed)
- `password_hash` (VARCHAR 255)
- `full_name` (VARCHAR 255)
- `role` (VARCHAR 20, Indexed) — `customer` | `engineer` | `admin`
- `status` (VARCHAR 20, Indexed) — `active` | `suspended` | `pending`
- `email_verified` (BIT)
- `created_at` (DATETIME2)

### 2. `bookings`
- `id` (VARCHAR 36, PK)
- `customer_id` (VARCHAR 36, FK -> `customers.id`, Indexed)
- `engineer_id` (VARCHAR 36, FK -> `engineers.id`, Indexed)
- `ticket_id` (VARCHAR 50, Unique, Indexed)
- `type` (VARCHAR 20) — `remote` | `onsite` | `emergency` | `amc`
- `status` (VARCHAR 20, Indexed) — `pending` | `assigned` | `in_progress` | `completed` | `cancelled`
- `phone` (VARCHAR 20, Indexed)
- `problem_description` (TEXT)
- `preferred_date` (VARCHAR 10)
- `preferred_time` (VARCHAR 5)
- `created_at` (DATETIME2, Indexed)

### 3. `technician_work_logs`
- `id` (VARCHAR 36, PK)
- `booking_id` (VARCHAR 36, FK -> `bookings.id`, Indexed)
- `engineer_id` (VARCHAR 36, FK -> `engineers.id`, Indexed)
- `check_in_time` (DATETIME2)
- `check_out_time` (DATETIME2)
- `check_in_lat` / `check_in_lng` (DECIMAL 10,7)
- `check_out_lat` / `check_out_lng` (DECIMAL 10,7)
- `before_photos_json` (TEXT)
- `after_photos_json` (TEXT)
- `digital_signature_url` (TEXT)
- `total_minutes` (INT)

### 4. `refresh_tokens`
- `id` (VARCHAR 36, PK)
- `user_id` (VARCHAR 36, FK -> `users.id`, Indexed)
- `token_hash` (VARCHAR 255, Unique, Indexed)
- `is_revoked` (BIT)
- `expires_at` (DATETIME2)
