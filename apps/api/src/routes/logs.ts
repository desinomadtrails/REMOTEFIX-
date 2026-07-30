import { Hono } from "hono";
import { desc, eq, and, like, or } from "drizzle-orm";
import { getDb } from "../db.js";
import { auditLogs, users } from "@remotefix/database";
import { requireAuth, requireRole, AppEnv } from "../middleware/auth.js";

const logsRouter = new Hono<AppEnv>();

// Apply admin access check
logsRouter.use("*", requireAuth, requireRole(["admin", "super_admin", "org_admin"]));

// ==========================================
// 1. LIST AUDIT LOGS WITH ADVANCED FILTERS
// ==========================================
logsRouter.get("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const list = await (db
      .select({
        id: auditLogs.id,
        organizationId: auditLogs.organizationId,
        departmentId: auditLogs.departmentId,
        userId: auditLogs.userId,
        action: auditLogs.action,
        actionType: auditLogs.actionType,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        oldValuesJson: auditLogs.oldValuesJson,
        newValuesJson: auditLogs.newValuesJson,
        reason: auditLogs.reason,
        status: auditLogs.status,
        details: auditLogs.details,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
        createdAt: auditLogs.createdAt,
        userEmail: users.email,
        userRole: users.role,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.createdAt)) as any)
      .limit(200);

    return c.json({ success: true, logs: list });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 2. EXPORT IMMUTABLE AUDIT LOGS AS CSV
// ==========================================
logsRouter.get("/export-csv", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const list = await (db
      .select({
        id: auditLogs.id,
        createdAt: auditLogs.createdAt,
        action: auditLogs.action,
        actionType: auditLogs.actionType,
        entityType: auditLogs.entityType,
        status: auditLogs.status,
        details: auditLogs.details,
        ipAddress: auditLogs.ipAddress,
        userEmail: users.email,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.createdAt)) as any)
      .limit(1000);

    let csv = "ID,Timestamp,Action,Action Type,Entity,Status,IP Address,User,Details\n";
    for (const row of list) {
      csv += `"${row.id}","${row.createdAt}","${row.action || ''}","${row.actionType || ''}","${row.entityType || ''}","${row.status || ''}","${row.ipAddress || ''}","${row.userEmail || 'System'}","${(row.details || '').replace(/"/g, '""')}"\n`;
    }

    return c.text(csv, 200, {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="remotefix-enterprise-audit-logs.csv"',
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

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
