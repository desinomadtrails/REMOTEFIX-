# Information Security Policy (ISP)

**Effective Date**: August 6, 2026  
**Company Name**: `[INSERT_REGISTERED_COMPANY_NAME]`  

---

## 1. Security Architecture Controls
- **Encryption**: TLS 1.3 in transit, TDE in Azure SQL, AES-256 server-side in Azure Blob Storage.
- **Passwords**: Salted `bcrypt` (12 rounds) hashing.
- **Token Security**: 15-minute Access Tokens with single-use 30-day Refresh Token rotation.
- **Access Control**: Principle of Least Privilege enforced via RBAC middleware (`requireAuth`, `requireRole`, `requireAdmin`).
- **File Upload Security**: Magic-byte binary verification, 5 MB file size limit, and UUID filename sanitization.
