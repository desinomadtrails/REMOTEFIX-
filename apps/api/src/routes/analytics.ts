import { Hono } from "hono";
import { count, sum, eq } from "drizzle-orm";
import { getDb } from "../db.js";
import { bookings, invoices, users, customers, engineers, payments } from "@remotefix/database";
import { requireAuth, requireRole, AppEnv } from "../middleware/auth.js";

const analyticsRouter = new Hono<AppEnv>();

// Apply admin access check to all analytics routes
analyticsRouter.use("*", requireAuth, requireRole(["admin"]));

// ==========================================
// 1. GET SYSTEM ANALYTICS
// ==========================================
analyticsRouter.get("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  
  try {
    // 1. Total revenue (Sum of payments)
    const revenueRes = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(eq(payments.status, "success"));
    const totalRevenue = parseFloat(revenueRes[0]?.total || "0");

    // 2. Count of bookings
    const bookingsCountRes = await db.select({ value: count(bookings.id) }).from(bookings);
    const totalBookings = bookingsCountRes[0]?.value || 0;

    // 3. Count of users by role
    const customersCount = await db.select({ value: count(customers.id) }).from(customers);
    const engineersCount = await db.select({ value: count(engineers.id) }).from(engineers);

    // 4. Booking Status counts
    const pendingBookings = await db.select({ value: count(bookings.id) }).from(bookings).where(eq(bookings.status, "pending"));
    const assignedBookings = await db.select({ value: count(bookings.id) }).from(bookings).where(eq(bookings.status, "assigned"));
    const inProgressBookings = await db.select({ value: count(bookings.id) }).from(bookings).where(eq(bookings.status, "in_progress"));
    const completedBookings = await db.select({ value: count(bookings.id) }).from(bookings).where(eq(bookings.status, "completed"));
    const cancelledBookings = await db.select({ value: count(bookings.id) }).from(bookings).where(eq(bookings.status, "cancelled"));

    // 5. Category breakdown
    // Standard SQL Group By is supported by drizzle, but doing quick counts for common categories is very reliable
    const remoteCount = await db.select({ value: count(bookings.id) }).from(bookings).where(eq(bookings.type, "remote"));
    const onsiteCount = await db.select({ value: count(bookings.id) }).from(bookings).where(eq(bookings.type, "onsite"));
    const emergencyCount = await db.select({ value: count(bookings.id) }).from(bookings).where(eq(bookings.type, "emergency"));
    
    return c.json({
      success: true,
      analytics: {
        totalRevenue,
        totalBookings,
        customersCount: customersCount[0]?.value || 0,
        engineersCount: engineersCount[0]?.value || 0,
        statusCounts: {
          pending: pendingBookings[0]?.value || 0,
          assigned: assignedBookings[0]?.value || 0,
          inProgress: inProgressBookings[0]?.value || 0,
          completed: completedBookings[0]?.value || 0,
          cancelled: cancelledBookings[0]?.value || 0,
        },
        typeCounts: {
          remote: remoteCount[0]?.value || 0,
          onsite: onsiteCount[0]?.value || 0,
          emergency: emergencyCount[0]?.value || 0,
        },
      },
    });
    
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export { analyticsRouter };
