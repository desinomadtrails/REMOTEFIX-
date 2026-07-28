import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db.js";
import { bookings, engineers, technicianWorkLogs } from "@remotefix/database";
import { requireAuth, requireRole, AppEnv } from "../middleware/auth.js";

const technicianWorkflowRouter = new Hono<AppEnv>();

// Apply engineer/admin auth middleware
technicianWorkflowRouter.use("*", requireAuth, requireRole(["engineer", "admin"]));

// ==========================================
// 1. CHECK IN TO SERVICE BOOKING
// ==========================================
technicianWorkflowRouter.post("/check-in", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const contextUser = c.get("user")!;

  try {
    const { bookingId, lat, lng } = await c.req.json();
    if (!bookingId) {
      return c.json({ success: false, error: "Booking ID is required for check-in" }, 400);
    }

    // Find engineer record for user
    const engList = await db.select().from(engineers).where(eq(engineers.userId, contextUser.id));
    const engineerId = engList.length > 0 ? engList[0].id : contextUser.id;

    // Check if work log already exists
    const existingLogs = await db
      .select()
      .from(technicianWorkLogs)
      .where(and(eq(technicianWorkLogs.bookingId, bookingId), eq(technicianWorkLogs.engineerId, engineerId)));

    const now = new Date();
    let workLogId = "";

    if (existingLogs.length > 0) {
      workLogId = existingLogs[0].id;
      await db
        .update(technicianWorkLogs)
        .set({
          checkInTime: now,
          checkInLat: lat ? String(lat) : null,
          checkInLng: lng ? String(lng) : null,
          updatedAt: now,
        } as any)
        .where(eq(technicianWorkLogs.id, workLogId));
    } else {
      workLogId = crypto.randomUUID();
      await db.insert(technicianWorkLogs).values({
        id: workLogId,
        bookingId,
        engineerId,
        checkInTime: now,
        checkInLat: lat ? String(lat) : null,
        checkInLng: lng ? String(lng) : null,
      } as any);
    }

    // Update booking status to in_progress
    await db.update(bookings).set({ status: "in_progress", engineerId }).where(eq(bookings.id, bookingId));

    return c.json({
      success: true,
      message: "Check-in successful",
      workLogId,
      checkInTime: now.toISOString(),
      gps: { lat, lng },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to execute check-in" }, 500);
  }
});

// ==========================================
// 2. UPLOAD BEFORE / AFTER PHOTOS & SIGNATURE
// ==========================================
technicianWorkflowRouter.post("/upload-work-assets", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const { bookingId, beforePhotos, afterPhotos, digitalSignature, notes } = await c.req.json();
    if (!bookingId) {
      return c.json({ success: false, error: "Booking ID is required" }, 400);
    }

    const existingLogs = await db
      .select()
      .from(technicianWorkLogs)
      .where(eq(technicianWorkLogs.bookingId, bookingId));

    if (existingLogs.length === 0) {
      return c.json({ success: false, error: "Work log not found for this booking. Check in first." }, 404);
    }

    const workLog = existingLogs[0];
    const updatePayload: any = { updatedAt: new Date() };

    if (beforePhotos && Array.isArray(beforePhotos)) {
      updatePayload.beforePhotosJson = JSON.stringify(beforePhotos);
    }
    if (afterPhotos && Array.isArray(afterPhotos)) {
      updatePayload.afterPhotosJson = JSON.stringify(afterPhotos);
    }
    if (digitalSignature) {
      updatePayload.digitalSignatureUrl = digitalSignature;
    }
    if (notes) {
      updatePayload.notes = notes;
    }

    await db.update(technicianWorkLogs).set(updatePayload).where(eq(technicianWorkLogs.id, workLog.id));

    return c.json({
      success: true,
      message: "Work assets updated successfully",
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to upload work assets" }, 500);
  }
});

// ==========================================
// 3. CHECK OUT & COMPLETE WORK
// ==========================================
technicianWorkflowRouter.post("/check-out", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const { bookingId, lat, lng, remarks, partsUsed } = await c.req.json();
    if (!bookingId) {
      return c.json({ success: false, error: "Booking ID is required for check-out" }, 400);
    }

    const existingLogs = await db
      .select()
      .from(technicianWorkLogs)
      .where(eq(technicianWorkLogs.bookingId, bookingId));

    if (existingLogs.length === 0) {
      return c.json({ success: false, error: "Work log not found. Check in first." }, 404);
    }

    const workLog = existingLogs[0];
    const now = new Date();
    const checkInMs = workLog.checkInTime ? new Date(workLog.checkInTime).getTime() : now.getTime();
    const durationMinutes = Math.max(1, Math.round((now.getTime() - checkInMs) / (1000 * 60)));

    await db
      .update(technicianWorkLogs)
      .set({
        checkOutTime: now,
        checkOutLat: lat ? String(lat) : null,
        checkOutLng: lng ? String(lng) : null,
        totalMinutes: durationMinutes,
        updatedAt: now,
      } as any)
      .where(eq(technicianWorkLogs.id, workLog.id));

    // Update booking status to completed
    await db
      .update(bookings)
      .set({
        status: "completed",
        remarks: remarks || workLog.notes || null,
        partsUsed: partsUsed || null,
      })
      .where(eq(bookings.id, bookingId));

    return c.json({
      success: true,
      message: "Check-out completed and service ticket resolved.",
      totalMinutes: durationMinutes,
      checkOutTime: now.toISOString(),
      gps: { lat, lng },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to execute check-out" }, 500);
  }
});

// ==========================================
// 4. GET WORK LOG DETAILS
// ==========================================
technicianWorkflowRouter.get("/log/:bookingId", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const bookingId = c.req.param("bookingId");

  try {
    const existingLogs = await db
      .select()
      .from(technicianWorkLogs)
      .where(eq(technicianWorkLogs.bookingId, bookingId));

    if (existingLogs.length === 0) {
      return c.json({ success: true, workLog: null });
    }

    const log = existingLogs[0];
    return c.json({
      success: true,
      workLog: {
        ...log,
        beforePhotos: log.beforePhotosJson ? JSON.parse(log.beforePhotosJson) : [],
        afterPhotos: log.afterPhotosJson ? JSON.parse(log.afterPhotosJson) : [],
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to retrieve work log" }, 500);
  }
});

export { technicianWorkflowRouter };
