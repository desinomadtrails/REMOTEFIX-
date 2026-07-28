import { Hono } from "hono";
import { getDb } from "../db.js";
import { AppEnv } from "../middleware/auth.js";

const healthRouter = new Hono<AppEnv>();

healthRouter.get("/", async (c) => {
  const startTime = Date.now();
  let dbStatus = "unknown";
  let dbLatencyMs = 0;
  let dbError: string | undefined = undefined;

  if (c.env && c.env.DATABASE_URL) {
    try {
      const dbPingStart = Date.now();
      const db = getDb(c.env.DATABASE_URL);
      await db.$client.request().query("SELECT 1 as ping");
      dbLatencyMs = Date.now() - dbPingStart;
      dbStatus = "connected";
    } catch (err: any) {
      dbStatus = "error";
      dbError = err.message || String(err);
    }
  } else {
    dbStatus = "not_configured";
  }

  const isHealthy = dbStatus === "connected" || dbStatus === "not_configured";
  const statusCode = isHealthy ? 200 : 503;

  return c.json(
    {
      status: isHealthy ? "healthy" : "unhealthy",
      service: "RemoteFix API Gateway",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
      checks: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
          error: dbError,
        },
      },
      durationMs: Date.now() - startTime,
    },
    statusCode
  );
});

export { healthRouter };
