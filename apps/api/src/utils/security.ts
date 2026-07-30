/**
 * Security Hardening Utilities (OWASP Top 10 Mitigation)
 */

/** Sanitize input strings to prevent Stored & Reflected Cross-Site Scripting (XSS) */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/** Redact sensitive credentials (passwords, tokens, API keys) from log outputs */
export function redactSensitiveData(data: any): any {
  if (!data || typeof data !== "object") return data;

  const sensitiveKeys = ["password", "token", "jwt", "secret", "certificatePem", "creditCard", "cvv"];
  const redacted = Array.isArray(data) ? [...data] : { ...data };

  for (const key of Object.keys(redacted)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      redacted[key] = "[REDACTED]";
    } else if (typeof redacted[key] === "object" && redacted[key] !== null) {
      redacted[key] = redactSensitiveData(redacted[key]);
    }
  }

  return redacted;
}
