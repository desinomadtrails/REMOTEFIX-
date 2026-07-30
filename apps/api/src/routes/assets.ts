import { Hono } from "hono";
import { eq, or } from "drizzle-orm";
import { getDb } from "../db.js";
import { assets } from "@remotefix/database";
import { AssetCreateSchema } from "@remotefix/types";
import { requireAuth, requireRole, AppEnv } from "../middleware/auth.js";

const assetsRouter = new Hono<AppEnv>();

// ==========================================
// 1. PUBLIC QR CODE SCANNER LOOKUP
// ==========================================
assetsRouter.get("/scan/:tag", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const tag = c.req.param("tag");

  try {
    const foundAssets = await db.select().from(assets).where(eq(assets.assetTag, tag));
    if (foundAssets.length === 0) {
      return c.json({ success: false, error: "Asset not found for this QR Tag" }, 404);
    }

    const asset = foundAssets[0];
    return c.json({
      success: true,
      asset: {
        id: asset.id,
        assetTag: asset.assetTag,
        name: asset.name,
        type: asset.type,
        brand: asset.brand,
        model: asset.model,
        serialNumber: asset.serialNumber,
        status: asset.status,
        warrantyExpiryDate: asset.warrantyExpiryDate,
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to lookup asset" }, 500);
  }
});

// Admin Auth Middleware for management endpoints
assetsRouter.use("*", requireAuth, requireRole(["admin", "engineer"]));

// ==========================================
// 2. GET ALL ASSETS (Admin)
// ==========================================
assetsRouter.get("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const assetsList = await db.select().from(assets);
    return c.json({ success: true, assets: assetsList });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to fetch assets" }, 500);
  }
});

// ==========================================
// 3. CREATE ASSET WITH QR TAG
// ==========================================
assetsRouter.post("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const body = await c.req.json();
    const result = AssetCreateSchema.safeParse(body);

    if (!result.success) {
      return c.json({ success: false, error: result.error.errors[0].message }, 400);
    }

    const { name, type, brand, model, serialNumber, organizationId, departmentId, purchaseDate, warrantyExpiryDate, notes } = result.data;

    // Generate unique Asset Tag & QR Code URL
    const randomHex = crypto.randomUUID().slice(-6).toUpperCase();
    const assetTag = `AST-2026-${randomHex}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`https://remotefix.com/book?assetTag=${assetTag}`)}`;

    const newAssetId = crypto.randomUUID();
    await db.insert(assets).values({
      id: newAssetId,
      organizationId: organizationId || null,
      departmentId: departmentId || null,
      assetTag,
      name,
      type,
      brand,
      model,
      serialNumber: serialNumber || null,
      qrCodeUrl,
      status: "active",
      purchaseDate: purchaseDate || null,
      warrantyExpiryDate: warrantyExpiryDate || null,
      notes: notes || null,
    });

    const created = await db.select().from(assets).where(eq(assets.id, newAssetId));
    return c.json({ success: true, asset: created[0] }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to create asset" }, 500);
  }
});

// ==========================================
// 4. UPDATE ASSET STATUS
// ==========================================
assetsRouter.patch("/:id/status", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const assetId = c.req.param("id");

  try {
    const { status } = await c.req.json();
    if (!["active", "maintenance", "retired"].includes(status)) {
      return c.json({ success: false, error: "Invalid asset status" }, 400);
    }

    await db.update(assets).set({ status, updatedAt: new Date() }).where(eq(assets.id, assetId));
    return c.json({ success: true, message: "Asset status updated" });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to update asset" }, 500);
  }
});

export { assetsRouter };
