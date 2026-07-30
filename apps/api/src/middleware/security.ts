import { MiddlewareHandler } from "hono";

export const securityHeaders: MiddlewareHandler = async (c, next) => {
  await next();

  // ── Helmet-equivalent security headers ─────────────────────────
  c.header("X-Frame-Options", "DENY");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  c.header("X-XSS-Protection", "1; mode=block");
  c.header("X-Permitted-Cross-Domain-Policies", "none");
  c.header("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=()");
  c.header("Cross-Origin-Opener-Policy", "same-origin");
  c.header("Cross-Origin-Resource-Policy", "same-site");
  
  c.header(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.database.windows.net https://*.azure.com https://*.cloudflare.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );
};
