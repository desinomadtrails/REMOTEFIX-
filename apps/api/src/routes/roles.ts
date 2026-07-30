import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../db.js";
import { roles, permissions } from "@remotefix/database";
import { requireAuth, requireRole, AppEnv } from "../middleware/auth.js";

const rolesRouter = new Hono<AppEnv>();

// Require admin access for role configuration
rolesRouter.use("*", requireAuth, requireRole(["admin", "super_admin", "org_admin"]));

// ==========================================
// 1. GET ALL ROLES & PERMISSIONS
// ==========================================
rolesRouter.get("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const rolesList = await db.select().from(roles);
    const permsList = await db.select().from(permissions);

    const rolesWithPerms = rolesList.map((r) => ({
      ...r,
      permissions: permsList.filter((p) => p.roleId === r.id),
    }));

    return c.json({ success: true, roles: rolesWithPerms });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to fetch RBAC roles" }, 500);
  }
});

// ==========================================
// 2. CREATE CUSTOM TENANT ROLE WITH PERMISSIONS
// ==========================================
rolesRouter.post("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const { name, displayName, description, organizationId, permissionsList } = await c.req.json();

    if (!name || !displayName) {
      return c.json({ success: false, error: "Role name and display name are required" }, 400);
    }

    const newRoleId = crypto.randomUUID();
    await db.insert(roles).values({
      id: newRoleId,
      organizationId: organizationId || null,
      name: name.toLowerCase().replace(/\s+/g, "_"),
      displayName,
      description: description || null,
      isSystem: false,
    });

    if (Array.isArray(permissionsList)) {
      for (const p of permissionsList) {
        if (p.resource && p.action) {
          await db.insert(permissions).values({
            id: crypto.randomUUID(),
            roleId: newRoleId,
            resource: p.resource,
            action: p.action,
          });
        }
      }
    }

    const created = await db.select().from(roles).where(eq(roles.id, newRoleId));
    return c.json({ success: true, role: created[0] }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to create custom role" }, 500);
  }
});

export { rolesRouter };
