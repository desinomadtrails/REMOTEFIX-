import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../db.js";
import { organizations, departments, users } from "@remotefix/database";
import { OrganizationCreateSchema, DepartmentCreateSchema } from "@remotefix/types";
import { requireAuth, requireRole, AppEnv } from "../middleware/auth.js";

const organizationsRouter = new Hono<AppEnv>();

// Apply admin auth middleware
organizationsRouter.use("*", requireAuth, requireRole(["admin"]));

// ==========================================
// 1. GET ALL ORGANIZATIONS
// ==========================================
organizationsRouter.get("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const orgsList = await db.select().from(organizations);
    return c.json({ success: true, organizations: orgsList });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to fetch organizations" }, 500);
  }
});

// ==========================================
// 2. CREATE ORGANIZATION
// ==========================================
organizationsRouter.post("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const body = await c.req.json();
    const result = OrganizationCreateSchema.safeParse(body);

    if (!result.success) {
      return c.json({ success: false, error: result.error.errors[0].message }, 400);
    }

    const { name, slug, domain, tier, maxEndpoints, logoUrl } = result.data;

    // Check slug uniqueness
    const existing = await db.select().from(organizations).where(eq(organizations.slug, slug));
    if (existing.length > 0) {
      return c.json({ success: false, error: "Organization slug already in use." }, 400);
    }

    const newOrgId = crypto.randomUUID();
    await db.insert(organizations).values({
      id: newOrgId,
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      domain: domain || null,
      tier,
      maxEndpoints,
      logoUrl: logoUrl || null,
      status: "active",
    });

    const created = await db.select().from(organizations).where(eq(organizations.id, newOrgId));
    return c.json({ success: true, organization: created[0] }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to create organization" }, 500);
  }
});

// ==========================================
// 3. GET DEPARTMENTS FOR ORGANIZATION
// ==========================================
organizationsRouter.get("/:id/departments", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const orgId = c.req.param("id");

  try {
    const depts = await db.select().from(departments).where(eq(departments.organizationId, orgId));
    return c.json({ success: true, departments: depts });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to fetch departments" }, 500);
  }
});

// ==========================================
// 4. CREATE DEPARTMENT
// ==========================================
organizationsRouter.post("/:id/departments", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const orgId = c.req.param("id");

  try {
    const body = await c.req.json();
    const result = DepartmentCreateSchema.safeParse({ ...body, organizationId: orgId });

    if (!result.success) {
      return c.json({ success: false, error: result.error.errors[0].message }, 400);
    }

    const { name, code, headUserId } = result.data;
    const newDeptId = crypto.randomUUID();

    await db.insert(departments).values({
      id: newDeptId,
      organizationId: orgId,
      name,
      code: code || null,
      headUserId: headUserId || null,
    });

    const created = await db.select().from(departments).where(eq(departments.id, newDeptId));
    return c.json({ success: true, department: created[0] }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to create department" }, 500);
  }
});

export { organizationsRouter };
