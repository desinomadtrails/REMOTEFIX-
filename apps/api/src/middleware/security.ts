import { MiddlewareHandler } from "hono";

export const securityHeaders: MiddlewareHandler = async (c, next) => {
  await next();
  
  // Helmet-equivalent security headers
  c.header("X-Frame-Options", "DENY");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Content-Security-Policy", "default-src 'self'; frame-ancestors 'none';");
  c.header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  c.header("X-XSS-Protection", "1; mode=block");
  c.header("X-Permitted-Cross-Domain-Policies", "none");
};
