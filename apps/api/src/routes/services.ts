import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../db.js";
import { services } from "@remotefix/database";
import { ServiceSchema } from "@remotefix/types";
import { requireAuth, requireRole, AppEnv } from "../middleware/auth.js";

const servicesRouter = new Hono<AppEnv>();

// ==========================================
// 1. GET ALL ACTIVE SERVICES (Public)
// ==========================================
servicesRouter.get("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  
  try {
    const list = await db
      .select()
      .from(services)
      .where(eq(services.isActive, true));
      
    return c.json({ success: true, services: list });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 2. GET ALL SERVICES (Admin only)
// ==========================================
servicesRouter.get("/all", requireAuth, requireRole(["admin"]), async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  
  try {
    const list = await db.select().from(services);
    return c.json({ success: true, services: list });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 3. GET SERVICE BY ID (Public)
// ==========================================
servicesRouter.get("/:id", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const id = c.req.param("id");
  
  try {
    const serviceList = await db.select().from(services).where(eq(services.id, id));
    if (serviceList.length === 0) {
      return c.json({ success: false, error: "Service not found" }, 404);
    }
    return c.json({ success: true, service: serviceList[0] });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 4. CREATE SERVICE (Admin only)
// ==========================================
servicesRouter.post("/", requireAuth, requireRole(["admin"]), async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  
  try {
    const body = await c.req.json();
    const result = ServiceSchema.safeParse(body);
    
    if (!result.success) {
      return c.json({ success: false, error: result.error.errors[0].message }, 400);
    }
    
    const serviceId = crypto.randomUUID();
    const newService = {
      id: serviceId,
      name: result.data.name,
      description: result.data.description,
      category: result.data.category,
      price: result.data.price.toString(), // Store as string for decimal compatibility in Drizzle
      estimatedDurationMinutes: result.data.estimatedDurationMinutes,
      isActive: result.data.isActive ?? true,
    };
    
    await db.insert(services).values(newService as any);
    
    return c.json({
      success: true,
      service: newService,
    }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 5. UPDATE SERVICE (Admin only)
// ==========================================
servicesRouter.put("/:id", requireAuth, requireRole(["admin"]), async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const id = c.req.param("id");
  
  try {
    const body = await c.req.json();
    const result = ServiceSchema.safeParse(body);
    
    if (!result.success) {
      return c.json({ success: false, error: result.error.errors[0].message }, 400);
    }
    
    const serviceList = await db.select().from(services).where(eq(services.id, id));
    if (serviceList.length === 0) {
      return c.json({ success: false, error: "Service not found" }, 404);
    }
    
    await db
      .update(services)
      .set({
        name: result.data.name,
        description: result.data.description,
        category: result.data.category,
        price: result.data.price.toString(),
        estimatedDurationMinutes: result.data.estimatedDurationMinutes,
        isActive: result.data.isActive,
        updatedAt: new Date(),
      } as any)
      .where(eq(services.id, id));
      
    return c.json({
      success: true,
      message: "Service updated successfully",
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 6. TOGGLE SERVICE STATUS (Admin only)
// ==========================================
servicesRouter.patch("/:id/toggle", requireAuth, requireRole(["admin"]), async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const id = c.req.param("id");
  
  try {
    const serviceList = await db.select().from(services).where(eq(services.id, id));
    if (serviceList.length === 0) {
      return c.json({ success: false, error: "Service not found" }, 404);
    }
    
    const service = serviceList[0];
    await db
      .update(services)
      .set({ isActive: !service.isActive, updatedAt: new Date() })
      .where(eq(services.id, id));
      
    return c.json({
      success: true,
      message: `Service status toggled to ${!service.isActive ? "active" : "inactive"}`,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export { servicesRouter };
