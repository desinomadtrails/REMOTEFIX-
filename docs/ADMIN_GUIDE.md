# RemoteFix Administrator Manual

## Role-Based Access Control (RBAC) Matrix

| System Role | Organizations | User Management | Tickets & Bookings | ITAM Assets | RMM Scripts | AMC & Billing | Audit Logs |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `super_admin` | Full Control | Full Control | Full Control | Full Control | Full Control | Full Control | Read/Export |
| `org_admin` | Tenant Scope | Tenant Scope | Full Control | Full Control | Full Control | Full Control | Read Scope |
| `manager` | View | View | Manage | Manage | Dispatch | View | - |
| `dispatcher` | - | - | Assign/Update | View | View | - | - |
| `technician` | - | - | Execute/Log | View | Run Shell | - | - |
| `finance` | - | - | View | View | - | Full Control | - |
| `viewer` | Read Only | Read Only | Read Only | Read Only | Read Only | Read Only | - |

## Key Enterprise Modules
1. **Multi-Tenant Switcher:** Located in the Admin top navigation bar to filter platform data by tenant organization.
2. **AI Copilot:** Incident diagnosis scripts and automated skill-based technician auto-assignment in Bookings console.
3. **Cross-Platform RMM:** Live telemetry (10s polling) and PowerShell/Bash automation script dispatcher in RMM Console.
4. **Disaster Recovery:** Encrypted AES-256 backup creation and point-in-time restore verification in Settings console.
