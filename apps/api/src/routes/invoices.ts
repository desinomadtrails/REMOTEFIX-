import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { getDb } from "../db.js";
import { invoices, bookings, customers } from "@remotefix/database";
import { InvoiceCreateSchema } from "@remotefix/types";
import { requireAuth, AppEnv } from "../middleware/auth.js";

const invoicesRouter = new Hono<AppEnv>();

// ==========================================
// 1. GENERATE INVOICE (Admin or Engineer)
// ==========================================
invoicesRouter.post("/", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  
  if (user.role !== "admin" && user.role !== "engineer") {
    return c.json({ success: false, error: "Forbidden: Only engineers or admins can generate invoices." }, 403);
  }
  
  try {
    const body = await c.req.json();
    const result = InvoiceCreateSchema.safeParse(body);
    
    if (!result.success) {
      return c.json({ success: false, error: result.error.errors[0].message }, 400);
    }
    
    const { bookingId, amount } = result.data;
    
    // Check if booking exists
    const bookingList = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId));
      
    if (bookingList.length === 0) {
      return c.json({ success: false, error: "Booking not found." }, 404);
    }
    
    const booking = bookingList[0];
    
    // Check if invoice already exists for this booking
    const existingInvoice = await db
      .select()
      .from(invoices)
      .where(eq(invoices.bookingId, bookingId));
      
    if (existingInvoice.length > 0) {
      return c.json({
        success: false,
        error: "An invoice has already been generated for this booking.",
        invoiceId: existingInvoice[0].id,
      }, 400);
    }
    
    const invoiceId = crypto.randomUUID();
    const invoiceNumber = `RF-${Date.now().toString().slice(-8)}`; // Generate clean visual Invoice Number
    
    await db.insert(invoices).values({
      id: invoiceId,
      bookingId,
      invoiceNumber,
      amount: amount.toString(),
      status: "unpaid",
      pdfUrl: null,
    } as any);
    
    return c.json({
      success: true,
      message: "Invoice generated successfully.",
      invoiceId,
      invoiceNumber,
    }, 201);
    
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 2. LIST INVOICES (Auth required)
// ==========================================
invoicesRouter.get("/", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  
  try {
    let list: any[] = [];
    
    if (user.role === "admin") {
      list = await db.select().from(invoices).orderBy(desc(invoices.createdAt));
    } else if (user.role === "customer") {
      const custRecord = await db
        .select()
        .from(customers)
        .where(eq(customers.userId, user.id));
        
      if (custRecord.length > 0) {
        // Fetch invoices linked to customer bookings
        list = await db
          .select({
            id: invoices.id,
            bookingId: invoices.bookingId,
            invoiceNumber: invoices.invoiceNumber,
            amount: invoices.amount,
            status: invoices.status,
            pdfUrl: invoices.pdfUrl,
            createdAt: invoices.createdAt,
          })
          .from(invoices)
          .leftJoin(bookings, eq(invoices.bookingId, bookings.id))
          .where(eq(bookings.customerId, custRecord[0].id))
          .orderBy(desc(invoices.createdAt));
      }
    }
    
    return c.json({ success: true, invoices: list });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 3. GET INVOICE BY ID (Auth required)
// ==========================================
invoicesRouter.get("/:id", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  const id = c.req.param("id");
  
  try {
    const invoiceList = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));
      
    if (invoiceList.length === 0) {
      return c.json({ success: false, error: "Invoice not found" }, 404);
    }
    
    const invoice = invoiceList[0];
    const bookingList = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, invoice.bookingId));
      
    const booking = bookingList[0];
    
    // Auth check
    if (user.role === "customer") {
      const custRecord = await db
        .select()
        .from(customers)
        .where(eq(customers.userId, user.id));
        
      if (custRecord.length === 0 || booking.customerId !== custRecord[0].id) {
        return c.json({ success: false, error: "Unauthorized access to invoice." }, 403);
      }
    }
    
    return c.json({
      success: true,
      invoice,
      booking,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export { invoicesRouter };
