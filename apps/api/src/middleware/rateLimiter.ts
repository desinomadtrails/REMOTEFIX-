import { MiddlewareHandler } from "hono";

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// Separate maps per route group for per-route limits
const rateLimitMaps = new Map<string, Map<string, RateLimitInfo>>();

function getMap(bucket: string): Map<string, RateLimitInfo> {
  if (!rateLimitMaps.has(bucket)) {
    rateLimitMaps.set(bucket, new Map<string, RateLimitInfo>());
  }
  return rateLimitMaps.get(bucket)!;
}

/**
 * Rate limiter factory.
 * @param limit     Max requests per window
 * @param windowMs  Window duration in ms
 * @param bucket    Optional bucket name to isolate limits per route group
 */
export function rateLimiter(limit = 100, windowMs = 60000, bucket = "global"): MiddlewareHandler {
  return async (c, next) => {
    // Prefer Cloudflare's real IP header, then standard forwarded header
    const ip =
      c.req.header("CF-Connecting-IP") ||
      c.req.header("X-Forwarded-For")?.split(",")[0].trim() ||
      "anonymous";

    const now = Date.now();
    const map = getMap(bucket);
    let info = map.get(ip);

    // Reset window if expired
    if (!info || now > info.resetTime) {
      info = { count: 0, resetTime: now + windowMs };
    }

    info.count++;
    map.set(ip, info);

    // Expose rate limit headers per RFC 6585
    c.header("X-RateLimit-Limit", limit.toString());
    c.header("X-RateLimit-Remaining", Math.max(0, limit - info.count).toString());
    c.header("X-RateLimit-Reset", Math.ceil(info.resetTime / 1000).toString());
    c.header("Retry-After", Math.ceil((info.resetTime - now) / 1000).toString());

    if (info.count > limit) {
      return c.json(
        {
          success: false,
          error: "Too many requests. Please slow down and try again later.",
          retryAfter: Math.ceil((info.resetTime - now) / 1000),
        },
        429
      );
    }

    await next();
  };
}

/** Strict limiter for auth endpoints (10 req/min to prevent brute-force) */
export const authRateLimiter = rateLimiter(10, 60000, "auth");

/** Standard API limiter (150 req/min) */
export const apiRateLimiter = rateLimiter(150, 60000, "api");
