import { MiddlewareHandler } from "hono";

export interface LogStructure {
  requestId: string;
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  durationMs?: number;
  ip?: string;
  userAgent?: string;
  error?: string;
}

export const structuredLogger: MiddlewareHandler = async (c, next) => {
  const startTime = Date.now();
  const requestId = c.req.header("X-Request-ID") || crypto.randomUUID();
  c.header("X-Request-ID", requestId);

  const ip =
    c.req.header("CF-Connecting-IP") ||
    c.req.header("X-Forwarded-For")?.split(",")[0].trim() ||
    "anonymous";

  try {
    await next();

    const durationMs = Date.now() - startTime;
    const logData: LogStructure = {
      requestId,
      timestamp: new Date().toISOString(),
      method: c.req.method,
      url: c.req.path,
      status: c.res.status,
      durationMs,
      ip,
      userAgent: c.req.header("User-Agent") || undefined,
    };

    // Log in JSON format for production ingestion (Datadog, CloudWatch, Loki)
    console.log(JSON.stringify(logData));
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    const logData: LogStructure = {
      requestId,
      timestamp: new Date().toISOString(),
      method: c.req.method,
      url: c.req.path,
      status: 500,
      durationMs,
      ip,
      error: err.message || "Internal server error",
    };
    console.error(JSON.stringify(logData));
    throw err;
  }
};
