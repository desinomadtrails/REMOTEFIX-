import { Hono } from "hono";
import { getDb } from "../db.js";
import { users, engineers, bookings, invoices } from "@remotefix/database";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, AppEnv } from "../middleware/auth.js";

const engineersRouter = new Hono<AppEnv>();

// ==========================================
// 1. GET ALL ENGINEERS WITH STATISTICS (Admin Required)
// ==========================================
engineersRouter.get("/", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  
  if (user.role !== "admin") {
    return c.json({ success: false, error: "Access denied. Administrator privileges required." }, 403);
  }
  
  try {
    // Fetch users joined with engineers
    const results = await db
      .select({
        id: engineers.id,
        userId: users.id,
        fullName: users.fullName,
        email: users.email,
        phone: engineers.phone,
        bio: engineers.bio,
        specialities: engineers.specialities,
        status: engineers.status,
        userStatus: users.status,
        createdAt: engineers.createdAt,
      })
      .from(engineers)
      .innerJoin(users, eq(engineers.userId, users.id));

    // Load statistics for each engineer
    const engineersWithStats = await Promise.all(
      results.map(async (eng) => {
        // Fetch bookings assigned to this engineer
        const bookingList = await db
          .select({
            id: bookings.id,
            status: bookings.status,
            preferredDate: bookings.preferredDate,
            preferredTime: bookings.preferredTime,
            problemDescription: bookings.problemDescription,
            ticketId: bookings.ticketId,
            remarks: bookings.remarks,
            partsUsed: bookings.partsUsed,
          })
          .from(bookings)
          .where(eq(bookings.engineerId, eng.id));

        // Get paid invoices to calculate performance revenue
        const invoiceList = await db
          .select({
            id: invoices.id,
            amount: invoices.amount,
            status: invoices.status,
          })
          .from(invoices)
          .where(eq(invoices.bookingId, sql`ANY(SELECT id FROM bookings WHERE engineer_id = ${eng.id})`));

        const totalRevenueGenerated = invoiceList
          .filter((inv) => inv.status === "paid")
          .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

        const completedCount = bookingList.filter((b) => b.status === "completed").length;
        const activeCount = bookingList.filter((b) => b.status === "assigned" || b.status === "in_progress").length;
        
        // Calculate success rate (%)
        const totalJobs = bookingList.filter((b) => b.status === "completed" || b.status === "cancelled").length;
        const successRate = totalJobs > 0 ? Math.round((completedCount / totalJobs) * 100) : 100;

        return {
          ...eng,
          bookings: bookingList,
          completedCount,
          activeCount,
          totalRevenueGenerated,
          successRate,
          specialitiesList: eng.specialities ? eng.specialities.split(",").map((s: string) => s.trim()) : [],
        };
      })
    );
    
    return c.json({
      success: true,
      engineers: engineersWithStats,
    });
    
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 2. CREATE A NEW ENGINEER (Admin Required)
// ==========================================
engineersRouter.post("/", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  
  if (user.role !== "admin") {
    return c.json({ success: false, error: "Access denied. Administrator privileges required." }, 403);
  }
  
  try {
    const { fullName, email, phone, bio, specialities, status, userStatus } = await c.req.json();
    
    if (!fullName || !email || !phone) {
      return c.json({ success: false, error: "Missing required fields (fullName, email, phone)" }, 400);
    }
    
    // Check if email already exists
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return c.json({ success: false, error: "A user with this email address already exists." }, 400);
    }
    
    const userId = crypto.randomUUID();
    const engineerId = crypto.randomUUID();
    
    // Insert into users
    await db.insert(users).values({
      id: userId,
      email,
      fullName,
      role: "engineer",
      status: userStatus || "active",
    });
    
    // Insert into engineers
    await db.insert(engineers).values({
      id: engineerId,
      userId,
      phone,
      bio: bio || null,
      specialities: specialities || null,
      status: status || "available",
    });
    
    return c.json({
      success: true,
      message: "Technician profile created successfully",
      engineerId,
    });
    
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 3. UPDATE ENGINEER (Admin Required)
// ==========================================
engineersRouter.put("/:id", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  const engineerId = c.req.param("id");
  
  if (user.role !== "admin") {
    return c.json({ success: false, error: "Access denied. Administrator privileges required." }, 403);
  }
  
  try {
    const { fullName, email, phone, bio, specialities, status, userStatus } = await c.req.json();
    
    const engRecord = await db
      .select()
      .from(engineers)
      .where(eq(engineers.id, engineerId));
      
    if (engRecord.length === 0) {
      return c.json({ success: false, error: "Technician profile not found" }, 404);
    }
    
    const eng = engRecord[0];
    
    // Update users table
    const userUpdates: any = { updatedAt: new Date() };
    if (fullName !== undefined) userUpdates.fullName = fullName;
    if (email !== undefined) userUpdates.email = email;
    if (userStatus !== undefined) userUpdates.status = userStatus;
    
    await db.update(users).set(userUpdates).where(eq(users.id, eng.userId));
    
    // Update engineers table
    const engUpdates: any = { updatedAt: new Date() };
    if (phone !== undefined) engUpdates.phone = phone;
    if (bio !== undefined) engUpdates.bio = bio;
    if (specialities !== undefined) engUpdates.specialities = specialities;
    if (status !== undefined) engUpdates.status = status;
    
    await db.update(engineers).set(engUpdates).where(eq(engineers.id, engineerId));
    
    return c.json({
      success: true,
      message: "Technician profile updated successfully",
    });
    
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 4. SUSPEND / TOGGLE ENGINEER STATUS (Admin Required)
// ==========================================
engineersRouter.delete("/:id", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  const engineerId = c.req.param("id");
  
  if (user.role !== "admin") {
    return c.json({ success: false, error: "Access denied. Administrator privileges required." }, 403);
  }
  
  try {
    const engRecord = await db
      .select()
      .from(engineers)
      .where(eq(engineers.id, engineerId));
      
    if (engRecord.length === 0) {
      return c.json({ success: false, error: "Technician profile not found" }, 404);
    }
    
    const eng = engRecord[0];
    
    // Toggle active vs suspended
    const userRecord = await db.select().from(users).where(eq(users.id, eng.userId));
    const currentStatus = userRecord[0]?.status || "active";
    const nextStatus = currentStatus === "suspended" ? "active" : "suspended";
    
    await db
      .update(users)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(eq(users.id, eng.userId));
      
    return c.json({
      success: true,
      message: `Technician account has been successfully ${nextStatus === "suspended" ? "suspended" : "reactivated"}.`,
    });
    
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export { engineersRouter };
