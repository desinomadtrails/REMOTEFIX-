import { Hono } from "hono";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../db.js";
import { auditLogs, users } from "@remotefix/database";
import { requireAuth, requireRole, AppEnv } from "../middleware/auth.js";

const logsRouter = new Hono<AppEnv>();

// Apply admin access check
logsRouter.use("*", requireAuth, requireRole(["admin"]));

// ==========================================
// 1. LIST AUDIT LOGS
// ==========================================
logsRouter.get("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  
  try {
    const list = await (db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        details: auditLogs.details,
        ipAddress: auditLogs.ipAddress,
        createdAt: auditLogs.createdAt,
        userId: auditLogs.userId,
        userEmail: users.email,
        userRole: users.role,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.createdAt)) as any)
      .limit(100); // Limit to last 100 entries for efficiency
      
    return c.json({ success: true, logs: list });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 2. CREATE AUDIT LOG ENTRY (Helper function)
// ==========================================
export async function writeAuditLog(
  databaseUrl: string,
  userId: string | null,
  action: string,
  details: string,
  ipAddress: string | null
): Promise<void> {
  const db = getDb(databaseUrl);
  try {
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      userId,
      action,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

export { logsRouter };
