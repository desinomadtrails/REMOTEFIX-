import { Hono } from "hono";
import { eq, or } from "drizzle-orm";
import { getDb } from "../db.js";
import { amcContracts } from "@remotefix/database";
import { AmcContractCreateSchema } from "@remotefix/types";
import { requireAuth, requireRole, AppEnv } from "../middleware/auth.js";

const amcRouter = new Hono<AppEnv>();

// Apply admin auth middleware
amcRouter.use("*", requireAuth, requireRole(["admin"]));

// ==========================================
// 1. GET ALL AMC CONTRACTS
// ==========================================
amcRouter.get("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const contracts = await db.select().from(amcContracts);
    return c.json({ success: true, contracts });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to fetch AMC contracts" }, 500);
  }
});

// ==========================================
// 2. CREATE AMC CONTRACT
// ==========================================
amcRouter.post("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const body = await c.req.json();
    const result = AmcContractCreateSchema.safeParse(body);

    if (!result.success) {
      return c.json({ success: false, error: result.error.errors[0].message }, 400);
    }

    const { title, deviceCount, startDate, endDate, contractAmount, organizationId, customerId } = result.data;

    const randomHex = crypto.randomUUID().slice(-6).toUpperCase();
    const contractNumber = `AMC-2026-${randomHex}`;
    const newContractId = crypto.randomUUID();

    await db.insert(amcContracts).values({
      id: newContractId,
      organizationId: organizationId || null,
      customerId: customerId || null,
      contractNumber,
      title,
      deviceCount,
      startDate,
      endDate,
      contractAmount: contractAmount.toString() as any,
      status: "active",
    });

    const created = await db.select().from(amcContracts).where(eq(amcContracts.id, newContractId));
    return c.json({ success: true, contract: created[0] }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to create AMC contract" }, 500);
  }
});

export { amcRouter };
