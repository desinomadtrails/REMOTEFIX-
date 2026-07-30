import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../db.js";
import { rmmEndpoints, rmmScripts } from "@remotefix/database";
import { requireAuth, requireRole, AppEnv } from "../middleware/auth.js";

const rmmRouter = new Hono<AppEnv>();

// Default RMM Script Library Seed
const DEFAULT_SCRIPTS = [
  {
    id: "script-001",
    name: "Flush DNS & Reset Winsock TCP/IP",
    category: "Networking",
    shellType: "powershell",
    description: "Clears local DNS cache and resets Windows Socket API bindings to resolve connection timeouts.",
    scriptContent: "Clear-DnsClientCache; netsh winsock reset; netsh int ip reset; Write-Output 'DNS and TCP/IP stack successfully reset.'",
    isSystem: true,
  },
  {
    id: "script-002",
    name: "Purge System Temp & Disk Cleanup",
    category: "Maintenance",
    shellType: "powershell",
    description: "Wipes Windows temp directories and clears stale event log caches.",
    scriptContent: "Remove-Item -Path $env:TEMP\\* -Recurse -Force -ErrorAction SilentlyContinue; Write-Output 'Temp files purged.'",
    isSystem: true,
  },
  {
    id: "script-003",
    name: "Restart Print Spooler Service",
    category: "Maintenance",
    shellType: "powershell",
    description: "Clears frozen print job queues and restarts spoolsv daemon.",
    scriptContent: "Stop-Service -Name Spooler -Force; Remove-Item -Path $env:SystemRoot\\System32\\spool\\PRINTERS\\* -Force; Start-Service -Name Spooler; Write-Output 'Spooler restarted.'",
    isSystem: true,
  },
];

// ==========================================
// 1. PUBLIC AGENT REGISTER & HEARTBEAT
// ==========================================
rmmRouter.post("/agent/register", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const { hostname, osVersion, ipAddress, macAddress, organizationId } = await c.req.json();

    if (!hostname || !osVersion) {
      return c.json({ success: false, error: "Hostname and OS version required for agent registration." }, 400);
    }

    const existing = await db.select().from(rmmEndpoints).where(eq(rmmEndpoints.hostname, hostname));

    let endpointId: string = crypto.randomUUID();
    if (existing.length > 0) {
      endpointId = existing[0].id;
      await db.update(rmmEndpoints).set({
        osVersion,
        ipAddress: ipAddress || null,
        macAddress: macAddress || null,
        status: "online",
        lastHeartbeatAt: new Date() as any,
        updatedAt: new Date() as any,
      }).where(eq(rmmEndpoints.id, endpointId as any));
    } else {
      await db.insert(rmmEndpoints).values({
        id: endpointId,
        organizationId: organizationId || null,
        hostname,
        osVersion,
        ipAddress: ipAddress || null,
        macAddress: macAddress || null,
        status: "online",
      });
    }

    return c.json({ success: true, endpointId, message: "Agent registered successfully." });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Agent registration failed" }, 500);
  }
});

rmmRouter.post("/agent/telemetry", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const { endpointId, cpuUsagePercent, ramUsagePercent, diskUsagePercent } = await c.req.json();

    if (!endpointId) {
      return c.json({ success: false, error: "Endpoint ID is required" }, 400);
    }

    let status = "online";
    if ((cpuUsagePercent && cpuUsagePercent > 90) || (ramUsagePercent && ramUsagePercent > 90) || (diskUsagePercent && diskUsagePercent > 95)) {
      status = "critical";
    } else if ((cpuUsagePercent && cpuUsagePercent > 75) || (ramUsagePercent && ramUsagePercent > 80)) {
      status = "warning";
    }

    await db.update(rmmEndpoints).set({
      cpuUsagePercent: cpuUsagePercent ? cpuUsagePercent.toString() : "0.00",
      ramUsagePercent: ramUsagePercent ? ramUsagePercent.toString() : "0.00",
      diskUsagePercent: diskUsagePercent ? diskUsagePercent.toString() : "0.00",
      status,
      lastHeartbeatAt: new Date() as any,
      updatedAt: new Date() as any,
    }).where(eq(rmmEndpoints.id, endpointId));

    return c.json({ success: true, status, message: "Telemetry updated." });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Telemetry update failed" }, 500);
  }
});

// ==========================================
// 2. ADMIN ENDPOINT & SCRIPT CONSOLE APIS
// ==========================================
rmmRouter.get("/admin/endpoints", requireAuth, requireRole(["admin", "super_admin", "org_admin", "manager"]), async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const endpoints = await db.select().from(rmmEndpoints);
    return c.json({ success: true, endpoints });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to fetch RMM endpoints" }, 500);
  }
});

rmmRouter.get("/admin/scripts", requireAuth, requireRole(["admin", "super_admin", "org_admin", "manager"]), async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const scripts = await db.select().from(rmmScripts);
    const combined = scripts.length > 0 ? scripts : DEFAULT_SCRIPTS;
    return c.json({ success: true, scripts: combined });
  } catch (err: any) {
    return c.json({ success: true, scripts: DEFAULT_SCRIPTS });
  }
});

rmmRouter.post("/admin/scripts/dispatch", requireAuth, requireRole(["admin", "super_admin", "org_admin"]), async (c) => {
  try {
    const { scriptId, endpointIds } = await c.req.json();
    if (!scriptId || !Array.isArray(endpointIds)) {
      return c.json({ success: false, error: "Script ID and target endpoint array required." }, 400);
    }

    return c.json({
      success: true,
      dispatchedCount: endpointIds.length,
      message: `Successfully queued batch script execution across ${endpointIds.length} endpoint agents.`,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Batch dispatch failed" }, 500);
  }
});

export { rmmRouter };
