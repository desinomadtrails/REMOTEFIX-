# Incident Response & Breach Notification Plan

**Effective Date**: August 6, 2026  
**Company Name**: `[INSERT_REGISTERED_COMPANY_NAME]`  

---

## 1. Incident Phases
1. **Identification**: Detection via audit log spikes, error rates, or CERT-In security advisories.
2. **Containment**: Immediate token revocation, IP blocking via Cloudflare firewall, or service isolation.
3. **Eradication**: Deployment of emergency patch releases to production API workers.
4. **Recovery**: Restoration from Azure SQL point-in-time automated backups.
5. **Notification**: CERT-In and Data Protection Board notification within mandatory 6-hour windows.
