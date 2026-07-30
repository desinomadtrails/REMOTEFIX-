import { Hono } from "hono";
import { getDb } from "../db.js";
import { AppEnv } from "../middleware/auth.js";

const healthRouter = new Hono<AppEnv>();

// 1. General Health Check
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
      service: "RemoteFix Enterprise API",
      version: "2.4.0",
      timestamp: new Date().toISOString(),
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

// 2. Kubernetes Liveness Probe
healthRouter.get("/liveness", (c) => {
  return c.json({ status: "alive", timestamp: new Date().toISOString() }, 200);
});

// 3. Kubernetes Readiness Probe
healthRouter.get("/readiness", async (c) => {
  try {
    const db = getDb(c.env.DATABASE_URL);
    await db.$client.request().query("SELECT 1 as ping");
    return c.json({ status: "ready", database: "connected", timestamp: new Date().toISOString() }, 200);
  } catch (err: any) {
    return c.json({ status: "not_ready", database: "disconnected", error: err.message }, 503);
  }
});

export { healthRouter };
