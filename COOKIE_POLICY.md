# Cookie Policy

**Effective Date**: August 6, 2026  
**Company Name**: `[INSERT_REGISTERED_COMPANY_NAME]`  

---

## 1. Overview
RemoteFix uses cookies and local browser storage (`localStorage`) to ensure security, authenticate sessions, and deliver high-performance user experiences.

## 2. Technologies Used

| Storage Key / Cookie | Type | Purpose | Expiry |
| :--- | :--- | :--- | :--- |
| `rf_token` | `localStorage` | JWT Access Token for API Authentication | 15 Minutes |
| `rf_refresh_token` | `localStorage` | Single-use Refresh Token Digest | 30 Days |
| `rf_user` | `localStorage` | Cached User Metadata for UI rendering | Session |

## 3. Managing Preferences
You can control or clear browser storage via your browser settings. Clearing `rf_token` will log you out of your current session.
