import { MiddlewareHandler } from "hono";

export const distributedTracing: MiddlewareHandler = async (c, next) => {
  const correlationId = c.req.header("x-correlation-id") || c.req.header("x-request-id") || crypto.randomUUID();

  // Attach correlation ID to request context & response headers
  c.header("x-correlation-id", correlationId);
  c.header("x-request-id", correlationId);

  try {
    await next();
  } catch (err: any) {
    console.error(`[TRACE:${correlationId}] Distributed Tracing Error Captured:`, {
      path: c.req.path,
      method: c.req.method,
      error: err.message || String(err),
      stack: err.stack,
    });
    throw err;
  }
};
