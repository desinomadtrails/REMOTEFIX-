# Online Actions Required & External Service Remediation Checklist

**Auditing Body**: Enterprise Cloud Operations & DevSecOps Practice  
**Target Infrastructure**: GitHub, Cloudflare, Render, Azure Cloud Services  
**Execution Timestamp**: 2026-08-07T14:24:00Z  
**Verification Standard**: Zero Fabrication Policy & Risk Matrix  

---

## 1. External Service Action Items

Below is the consolidated matrix of required online administrative actions across external services:

| Online Service | Current Status | Risk | Action Required | Priority | Estimated Time | Responsible Person |
| :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| **GitHub** | ⚪ NOT VERIFIED (Live Access) | High | Enable Secret Scanning, Push Protection & Dependabot Security Updates | High | 15 mins | DevSecOps Lead |
| **GitHub** | ⚪ NOT VERIFIED (Live Access) | Medium | Configure `main` Branch Protection Ruleset (require 1 approval + CI status checks) | High | 10 mins | Lead Architect |
| **Azure SQL** | 🟢 VERIFIED (Code Level) | High | Rotate Database User Password in Azure Portal | High | 10 mins | DBA / DevSecOps |
| **Azure SQL** | ⚪ NOT VERIFIED (Live Access) | High | Restrict SQL Server Firewall to authorized App Service / Worker IPs | High | 15 mins | Cloud Architect |
| **Azure Storage**| 🟢 VERIFIED (Code Level) | Medium | Regenerate Primary & Secondary Access Keys in Azure Portal | Medium | 10 mins | Cloud Architect |
| **Cloudflare** | 🟢 VERIFIED (Code Level) | High | Set `JWT_SECRET` and `DATABASE_URL` via `wrangler secret put` | High | 10 mins | DevSecOps Lead |
| **Cloudflare** | ⚪ NOT VERIFIED (Live Access) | Medium | Enable SSL Full (Strict) mode and HSTS preloading in Cloudflare dashboard | Medium | 10 mins | SRE Lead |
| **Render** | 🟢 VERIFIED (Code Level) | High | Configure production `JWT_SECRET` and `DATABASE_URL` in Render Dashboard | High | 10 mins | DevSecOps Lead |

---

## 2. Summary

- **Total Online Action Items**: 8 Tasks
- **Estimated Execution Time**: ~90 Minutes total
