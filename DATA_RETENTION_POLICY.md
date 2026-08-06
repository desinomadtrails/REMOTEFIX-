# Data Retention & Destruction Policy

**Effective Date**: August 6, 2026  
**Company Name**: `[INSERT_REGISTERED_COMPANY_NAME]`  

---

## Retention Schedule Matrix

| Data Category | Storage Target | Retention Period | Destruction Method |
| :--- | :--- | :--- | :--- |
| **Account Credentials** | Azure SQL (`users`) | Duration of Active Account + 180 Days | Cryptographic purge of DB row |
| **Service Invoices & Billing** | Azure SQL (`invoices`) | 7 Years (Financial Law) | Automated purging after 7 years |
| **Diagnostic Uploads** | Azure Blob Storage | 90 Days post completion | Automated Blob Lifecycle Deletion |
| **Security Audit Logs** | Azure SQL (`audit_logs`) | 365 Days | Truncation of expired log partitions |
