import { Hono } from "hono";
import { getDb } from "../db.js";
import { organizations, rmmEndpoints, bookings, auditLogs } from "@remotefix/database";
import { AppEnv } from "../middleware/auth.js";

const metricsRouter = new Hono<AppEnv>();

metricsRouter.get("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  let orgCount = 0;
  let rmmCount = 0;
  let bookingCount = 0;
  let auditCount = 0;

  try {
    const orgs = await db.select().from(organizations);
    orgCount = orgs.length;

    const rmms = await db.select().from(rmmEndpoints);
    rmmCount = rmms.length;

    const bks = await db.select().from(bookings);
    bookingCount = bks.length;

    const logs = await db.select().from(auditLogs);
    auditCount = logs.length;
  } catch (err) {
    console.error("Failed to query metrics:", err);
  }

  const prometheusMetrics = `# HELP remotefix_active_organizations Total number of registered tenant organizations
# TYPE remotefix_active_organizations gauge
remotefix_active_organizations ${orgCount}

# HELP remotefix_active_rmm_endpoints Total number of managed cross-platform RMM agents
# TYPE remotefix_active_rmm_endpoints gauge
remotefix_active_rmm_endpoints ${rmmCount}

# HELP remotefix_total_bookings Total service bookings created
# TYPE remotefix_total_bookings counter
remotefix_total_bookings ${bookingCount}

# HELP remotefix_total_audit_logs Total immutable audit log entries recorded
# TYPE remotefix_total_audit_logs counter
remotefix_total_audit_logs ${auditCount}

# HELP remotefix_up Application liveness indicator
# TYPE remotefix_up gauge
remotefix_up 1
`;

  return c.text(prometheusMetrics, 200, { "Content-Type": "text/plain; version=0.0.4" });
});

export { metricsRouter };
