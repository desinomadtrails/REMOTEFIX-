import { getDb } from "../db.js";
import { auditLogs } from "@remotefix/database";

export interface LogAuditParams {
  c: any;
  action: string;
  actionType: string;
  entityType?: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  reason?: string;
  status?: "success" | "failed";
  details: string;
}

/** Record an immutable enterprise audit log entry in Azure SQL Database */
export async function logAuditEvent(params: LogAuditParams): Promise<void> {
  const { c, action, actionType, entityType, entityId, oldValues, newValues, reason, status = "success", details } = params;

  try {
    const user = c.get("user");
    const ipAddress = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "127.0.0.1";
    const userAgent = c.req.header("user-agent") || "unknown";

    const db = getDb(c.env.DATABASE_URL);

    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      organizationId: user?.organizationId || null,
      departmentId: user?.departmentId || null,
      userId: user?.id || null,
      action,
      actionType,
      entityType: entityType || null,
      entityId: entityId || null,
      oldValuesJson: oldValues ? JSON.stringify(oldValues) : null,
      newValuesJson: newValues ? JSON.stringify(newValues) : null,
      reason: reason || null,
      status,
      details,
      ipAddress: ipAddress.slice(0, 45),
      userAgent: userAgent.slice(0, 500),
    });
  } catch (err) {
    console.error("Failed to write audit log entry:", err);
  }
}
