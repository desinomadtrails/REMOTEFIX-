# RemoteFix Enterprise Platform - Data Inventory & Classification Matrix

**Author**: Compliance Officer & Data Governance Lead  
**Date**: August 6, 2026  

---

## Data Category & Sensitivity Classification

| Field Name | Category | Sensitivity Level | Purpose | Primary Storage | Encryption at Rest | Encryption in Transit | Legal Basis (DPDP / GDPR) |
| :--- | :--- | :---: | :--- | :--- | :---: | :---: | :--- |
| `email` | Personal Identity | **High** | Authentication & Communications | Azure SQL (`users`) | Transparent Data Encryption (TDE) | TLS 1.3 | Contract Execution / Consent |
| `password_hash` | Security Secret | **Critical** | Authentication | Azure SQL (`users`) | bcrypt (12 rounds) | TLS 1.3 | Contract Execution |
| `phone` / `mobile` | Personal Identity | **High** | OTP Verification & Service Dispatch | Azure SQL (`customers`) | TDE | TLS 1.3 | Contract Execution |
| `billing_address` | Location Data | **Medium** | On-site Technician Dispatch & Invoicing | Azure SQL (`customers`) | TDE | TLS 1.3 | Legal / Tax Compliance |
| `ip_address` | Telemetry Data | **Medium** | Rate Limiting & Fraud Audit Logs | Azure SQL (`audit_logs`) | TDE | TLS 1.3 | Legitimate Uses (Security) |
| `token_hash` | Session Credential | **Critical** | JWT Refresh Token Rotation | Azure SQL (`refresh_tokens`) | SHA-256 Digest | TLS 1.3 | Contract Execution |
| `booking_images` | Diagnostic Data | **Medium** | Hardware Issue Verification | Azure Blob Storage | AES-256 Server-Side | TLS 1.3 | Performance of Contract |
| `audit_logs` | Audit Trail | **High** | Regulatory Compliance & System Integrity | Azure SQL (`audit_logs`) | TDE | TLS 1.3 | Legal Obligation / Security |
