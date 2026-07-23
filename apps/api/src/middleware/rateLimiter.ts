import { MiddlewareHandler } from "hono";

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitInfo>();

export function rateLimiter(limit = 100, windowMs = 60000): MiddlewareHandler {
  return async (c, next) => {
    // Determine the user's IP address from Cloudflare headers or proxy headers
    const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "anonymous";
    const now = Date.now();
    
    let info = rateLimitMap.get(ip);
    
    // Reset window if expired
    if (!info || now > info.resetTime) {
      info = {
        count: 0,
        resetTime: now + windowMs,
      };
    }
    
    info.count++;
    rateLimitMap.set(ip, info);
    
    c.header("X-RateLimit-Limit", limit.toString());
    c.header("X-RateLimit-Remaining", Math.max(0, limit - info.count).toString());
    c.header("X-RateLimit-Reset", Math.ceil(info.resetTime / 1000).toString());
    
    if (info.count > limit) {
      return c.json(
        {
          success: false,
          error: "Too many requests. Please try again later.",
        },
        429
      );
    }
    
    await next();
  };
}
