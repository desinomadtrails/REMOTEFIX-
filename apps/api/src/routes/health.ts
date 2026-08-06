import { Hono } from "hono";
import { getDbAsync, getDb, getDbStatusDetails } from "../db.js";
import { getDbConfig } from "@remotefix/database";
import { AppEnv } from "../middleware/auth.js";

const healthRouter = new Hono<AppEnv>();

async function executePingQuery(db: any, timeoutMs = 5000): Promise<number> {
  const start = Date.now();
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Database ping query timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  try {
    const queryPromise = db.$client.request().query("SELECT 1 as ping");
    await Promise.race([queryPromise, timeoutPromise]);
    return Date.now() - start;
  } finally {
    clearTimeout(timer);
  }
}

// 1. General Health Check Endpoint
healthRouter.get("/", async (c) => {
  const startTime = Date.now();
  let dbStatus = "unknown";
  let dbLatencyMs = 0;
  let dbError: string | undefined = undefined;

  const dbUrl = (c.env && c.env.DATABASE_URL) || process.env.DATABASE_URL || "";
  const dbConfig = getDbConfig(dbUrl);

  const host = dbConfig.server || process.env.DB_HOST || "not_configured";
  const database = dbConfig.database || process.env.DB_NAME || "not_configured";
  const userConfigured = Boolean(dbConfig.user || process.env.DB_USER);

  if (host !== "not_configured" && host !== "") {
    try {
      const db = await getDbAsync(dbUrl);
      dbLatencyMs = await executePingQuery(db, 5000);
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
          host,
          database,
          userConfigured,
          latencyMs: dbLatencyMs,
          error: dbError,
        },
      },
      durationMs: Date.now() - startTime,
    },
    statusCode
  );
});

// 2. Liveness Probe (Always returns 200 OK for process health)
healthRouter.get("/liveness", (c) => {
  return c.json({ status: "alive", timestamp: new Date().toISOString() }, 200);
});

// 3. Readiness Probe (Checks database readiness)
healthRouter.get("/readiness", async (c) => {
  const dbUrl = (c.env && c.env.DATABASE_URL) || process.env.DATABASE_URL || "";
  try {
    const db = await getDbAsync(dbUrl);
    await executePingQuery(db, 5000);
    return c.json({ status: "ready", database: "connected", timestamp: new Date().toISOString() }, 200);
  } catch (err: any) {
    return c.json({ status: "not_ready", database: "disconnected", error: err.message || String(err) }, 503);
  }
});

export { healthRouter };

