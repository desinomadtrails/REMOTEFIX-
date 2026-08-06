import { MiddlewareHandler } from "hono";

interface RateLimitInfo {
  count: number;
  resetTime: number;
  backoffMultiplier: number;
}

const rateLimitMaps = new Map<string, Map<string, RateLimitInfo>>();

function getMap(bucket: string): Map<string, RateLimitInfo> {
  if (!rateLimitMaps.has(bucket)) {
    rateLimitMaps.set(bucket, new Map<string, RateLimitInfo>());
  }
  return rateLimitMaps.get(bucket)!;
}

function parseEnvInt(envVal: any, defaultVal: number): number {
  if (!envVal) return defaultVal;
  const parsed = parseInt(String(envVal), 10);
  return isNaN(parsed) || parsed <= 0 ? defaultVal : parsed;
}

/**
 * Configurable rate limiter factory with exponential backoff.
 * @param envKey        Environment variable key for limit threshold
 * @param defaultLimit Default limit if env variable is unset
 * @param bucket       Isolated bucket name per endpoint
 */
export function configurableRateLimiter(
  envKey: string,
  defaultLimit: number,
  bucket: string
): MiddlewareHandler {
  return async (c, next) => {
    const windowSeconds = parseEnvInt(
      c.env?.RATE_LIMIT_WINDOW_SECONDS || process.env.RATE_LIMIT_WINDOW_SECONDS,
      60
    );
    const limit = parseEnvInt(
      c.env?.[envKey] || process.env[envKey],
      defaultLimit
    );
    const windowMs = windowSeconds * 1000;

    const ip =
      c.req.header("CF-Connecting-IP") ||
      c.req.header("X-Forwarded-For")?.split(",")[0].trim() ||
      "anonymous";

    const now = Date.now();
    const map = getMap(bucket);
    let info = map.get(ip);

    if (!info || now > info.resetTime) {
      info = { count: 0, resetTime: now + windowMs, backoffMultiplier: 1 };
    }

    info.count++;

    if (info.count > limit) {
      // Calculate exponential backoff multiplier (capped at 3,600 seconds)
      const excess = info.count - limit;
      const backoffSeconds = Math.min(3600, windowSeconds * Math.pow(2, Math.min(excess, 6)));
      info.resetTime = now + backoffSeconds * 1000;
      map.set(ip, info);

      c.header("X-RateLimit-Limit", limit.toString());
      c.header("X-RateLimit-Remaining", "0");
      c.header("X-RateLimit-Reset", Math.ceil(info.resetTime / 1000).toString());
      c.header("Retry-After", backoffSeconds.toString());

      return c.json(
        {
          success: false,
          error: "Too many requests. Rate limit exceeded. Please slow down and try again later.",
          retryAfterSeconds: backoffSeconds,
        },
        429
      );
    }

    map.set(ip, info);

    c.header("X-RateLimit-Limit", limit.toString());
    c.header("X-RateLimit-Remaining", (limit - info.count).toString());
    c.header("X-RateLimit-Reset", Math.ceil(info.resetTime / 1000).toString());

    await next();
  };
}

// Configurable endpoint-specific limiters
export const loginRateLimiter = configurableRateLimiter("RATE_LIMIT_LOGIN", 5, "login");
export const registerRateLimiter = configurableRateLimiter("RATE_LIMIT_REGISTER", 3, "register");
export const forgotPasswordRateLimiter = configurableRateLimiter("RATE_LIMIT_FORGOT_PASSWORD", 2, "forgot_password");
export const refreshRateLimiter = configurableRateLimiter("RATE_LIMIT_REFRESH", 10, "refresh");
export const authRateLimiter = configurableRateLimiter("RATE_LIMIT_AUTH", 10, "auth");
export const publicRateLimiter = configurableRateLimiter("RATE_LIMIT_PUBLIC", 30, "public");
export const apiRateLimiter = configurableRateLimiter("RATE_LIMIT_API", 150, "api");
