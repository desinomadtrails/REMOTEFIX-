import { MiddlewareHandler } from "hono";

export const securityHeaders: MiddlewareHandler = async (c, next) => {
  await next();

  // ── Helmet-equivalent security headers ─────────────────────────
  // Prevent clickjacking
  c.header("X-Frame-Options", "DENY");
  // Prevent MIME sniffing
  c.header("X-Content-Type-Options", "nosniff");
  // Referrer policy
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  // HSTS — force HTTPS for 2 years
  c.header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  // Legacy XSS filter
  c.header("X-XSS-Protection", "1; mode=block");
  // Disallow cross-domain policies
  c.header("X-Permitted-Cross-Domain-Policies", "none");
  // Disable browser features / permissions
  c.header("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=()");
  // Content Security Policy — allow fonts, images, scripts from same origin
  // Also allows Google Fonts and Cloudflare CDN for admin UI
  c.header(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for Vite HMR in dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.database.windows.net https://*.azure.com https://*.cloudflare.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );
};
