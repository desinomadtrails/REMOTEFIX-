import { Hono } from "hono";
import { getDb } from "../db.js";
import { users, customers, bookings, invoices } from "@remotefix/database";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, AppEnv } from "../middleware/auth.js";

const customersRouter = new Hono<AppEnv>();

// ==========================================
// 1. GET ALL CUSTOMERS WITH STATISTICS (Admin Required)
// ==========================================
customersRouter.get("/", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  
  if (user.role !== "admin") {
    return c.json({ success: false, error: "Access denied. Administrator privileges required." }, 403);
  }
  
  try {
    // Fetch users joined with customers
    const results = await db
      .select({
        id: customers.id,
        userId: users.id,
        fullName: users.fullName,
        email: users.email,
        phone: customers.phone,
        companyName: customers.companyName,
        billingAddress: customers.billingAddress,
        userStatus: users.status,
        createdAt: customers.createdAt,
      })
      .from(customers)
      .innerJoin(users, eq(customers.userId, users.id));

    // For each customer, let's load bookings and invoices for history
    const customersWithStats = await Promise.all(
      results.map(async (cust) => {
        // Count bookings
        const bookingList = await db
          .select({
            id: bookings.id,
            status: bookings.status,
            preferredDate: bookings.preferredDate,
            problemDescription: bookings.problemDescription,
            ticketId: bookings.ticketId,
          })
          .from(bookings)
          .where(eq(bookings.customerId, cust.id));

        // Get invoices
        const invoiceList = await db
          .select({
            id: invoices.id,
            amount: invoices.amount,
            status: invoices.status,
            invoiceNumber: invoices.invoiceNumber,
          })
          .from(invoices)
          .where(eq(invoices.bookingId, sql`ANY(SELECT id FROM bookings WHERE customer_id = ${cust.id})`));

        const totalSpent = invoiceList
          .filter((inv) => inv.status === "paid")
          .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

        // Determine if they are registered or guest based on userStatus
        const isGuest = cust.userStatus === "pending";

        return {
          ...cust,
          bookings: bookingList,
          invoices: invoiceList,
          bookingCount: bookingList.length,
          totalSpent,
          isGuest,
        };
      })
    );
    
    return c.json({
      success: true,
      customers: customersWithStats,
    });
    
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 2. CREATE A NEW CUSTOMER (Admin Required)
// ==========================================
customersRouter.post("/", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  
  if (user.role !== "admin") {
    return c.json({ success: false, error: "Access denied. Administrator privileges required." }, 403);
  }
  
  try {
    const { fullName, email, phone, companyName, billingAddress, userStatus } = await c.req.json();
    
    if (!fullName || !email || !phone) {
      return c.json({ success: false, error: "Missing required fields (fullName, email, phone)" }, 400);
    }
    
    // Check if user email already exists
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return c.json({ success: false, error: "A user with this email address already exists." }, 400);
    }
    
    const userId = crypto.randomUUID();
    const customerId = crypto.randomUUID();
    
    // Insert into users
    await db.insert(users).values({
      id: userId,
      email,
      fullName,
      role: "customer",
      status: userStatus || "active",
    });
    
    // Insert into customers
    await db.insert(customers).values({
      id: customerId,
      userId,
      phone,
      companyName: companyName || null,
      billingAddress: billingAddress || null,
    });
    
    return c.json({
      success: true,
      message: "Customer profile created successfully",
      customerId,
    });
    
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 3. UPDATE CUSTOMER (Admin Required)
// ==========================================
customersRouter.put("/:id", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  const customerId = c.req.param("id");
  
  if (user.role !== "admin") {
    return c.json({ success: false, error: "Access denied. Administrator privileges required." }, 403);
  }
  
  try {
    const { fullName, email, phone, companyName, billingAddress, userStatus } = await c.req.json();
    
    const custRecord = await db
      .select()
      .from(customers)
      .where(eq(customers.id, customerId));
      
    if (custRecord.length === 0) {
      return c.json({ success: false, error: "Customer not found" }, 404);
    }
    
    const cust = custRecord[0];
    
    // Update users table
    const userUpdates: any = { updatedAt: new Date() };
    if (fullName !== undefined) userUpdates.fullName = fullName;
    if (email !== undefined) userUpdates.email = email;
    if (userStatus !== undefined) userUpdates.status = userStatus;
    
    await db.update(users).set(userUpdates).where(eq(users.id, cust.userId));
    
    // Update customers table
    const custUpdates: any = { updatedAt: new Date() };
    if (phone !== undefined) custUpdates.phone = phone;
    if (companyName !== undefined) custUpdates.companyName = companyName;
    if (billingAddress !== undefined) custUpdates.billingAddress = billingAddress;
    
    await db.update(customers).set(custUpdates).where(eq(customers.id, customerId));
    
    return c.json({
      success: true,
      message: "Customer profile updated successfully",
    });
    
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 4. TOGGLE SUSPENSION / DELETE CUSTOMER (Admin Required)
// ==========================================
customersRouter.delete("/:id", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  const customerId = c.req.param("id");
  
  if (user.role !== "admin") {
    return c.json({ success: false, error: "Access denied. Administrator privileges required." }, 403);
  }
  
  try {
    const custRecord = await db
      .select()
      .from(customers)
      .where(eq(customers.id, customerId));
      
    if (custRecord.length === 0) {
      return c.json({ success: false, error: "Customer not found" }, 404);
    }
    
    const cust = custRecord[0];
    
    // Toggle active vs suspended
    const userRecord = await db.select().from(users).where(eq(users.id, cust.userId));
    const currentStatus = userRecord[0]?.status || "active";
    const nextStatus = currentStatus === "suspended" ? "active" : "suspended";
    
    await db
      .update(users)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(eq(users.id, cust.userId));
      
    return c.json({
      success: true,
      message: `Customer account has been successfully ${nextStatus === "suspended" ? "suspended" : "reactivated"}.`,
    });
    
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export { customersRouter };
