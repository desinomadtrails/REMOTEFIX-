import { Hono } from "hono";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../db.js";
import { notificationQueue, notificationTemplates } from "@remotefix/database";
import { requireAuth, requireRole, AppEnv } from "../middleware/auth.js";

const notificationsRouter = new Hono<AppEnv>();

// Apply auth middleware
notificationsRouter.use("*", requireAuth);

// ==========================================
// 1. GET IN-APP NOTIFICATIONS FOR LOGGED IN USER
// ==========================================
notificationsRouter.get("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const list = await (db
      .select()
      .from(notificationQueue)
      .orderBy(desc(notificationQueue.createdAt)) as any)
      .limit(50);

    return c.json({ success: true, notifications: list });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 2. ADMIN NOTIFICATION QUEUE MONITOR & TEMPLATES
// ==========================================
notificationsRouter.get("/admin/queue", requireRole(["admin", "super_admin", "org_admin"]), async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const queue = await (db.select().from(notificationQueue).orderBy(desc(notificationQueue.createdAt)) as any).limit(100);
    return c.json({ success: true, queue });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

notificationsRouter.get("/admin/templates", requireRole(["admin", "super_admin", "org_admin"]), async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const templates = await db.select().from(notificationTemplates);
    return c.json({ success: true, templates });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

notificationsRouter.post("/admin/templates", requireRole(["admin", "super_admin", "org_admin"]), async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const { eventKey, channel, subject, bodyTemplate } = await c.req.json();
    if (!eventKey || !subject || !bodyTemplate) {
      return c.json({ success: false, error: "Event key, subject, and body template required." }, 400);
    }

    const templateId = crypto.randomUUID();
    await db.insert(notificationTemplates).values({
      id: templateId,
      eventKey,
      channel: channel || "in_app",
      subject,
      bodyTemplate,
      isEnabled: true,
    });

    const created = await db.select().from(notificationTemplates).where(eq(notificationTemplates.id, templateId));
    return c.json({ success: true, template: created[0] }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export { notificationsRouter };
