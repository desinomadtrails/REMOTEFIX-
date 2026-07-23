import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { getDb } from "../db.js";
import { payments, invoices, bookings, customers } from "@remotefix/database";
import { PaymentCreateSchema } from "@remotefix/types";
import { requireAuth, AppEnv } from "../middleware/auth.js";

const paymentsRouter = new Hono<AppEnv>();

// ==========================================
// 1. SUBMIT PAYMENT (Customer only)
// ==========================================
paymentsRouter.post("/", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  
  try {
    const body = await c.req.json();
    const result = PaymentCreateSchema.safeParse(body);
    
    if (!result.success) {
      return c.json({ success: false, error: result.error.errors[0].message }, 400);
    }
    
    const { invoiceId, paymentMethod, transactionId, amount } = result.data;
    
    // Fetch invoice
    const invoiceList = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId));
      
    if (invoiceList.length === 0) {
      return c.json({ success: false, error: "Invoice not found" }, 404);
    }
    
    const invoice = invoiceList[0];
    
    if (invoice.status === "paid") {
      return c.json({ success: false, error: "Invoice is already paid." }, 400);
    }
    
    // Auth check: verify invoice belongs to customer
    const bookingList = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, invoice.bookingId));
      
    const booking = bookingList[0];
    const custRecord = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, user.id));
    
    if (user.role === "customer") {
      if (custRecord.length === 0 || booking.customerId !== custRecord[0].id) {
        return c.json({ success: false, error: "Unauthorized: Invoice does not belong to your account." }, 403);
      }
    }
    
    const paymentId = crypto.randomUUID();
    
    // Write payment record and update invoice status atomically
    await db.transaction(async (tx) => {
      // Insert Payment
      await tx.insert(payments).values({
        id: paymentId,
        invoiceId,
        paymentMethod,
        transactionId,
        amount: amount.toString(),
        status: "success",
      } as any);
      
      // Update Invoice status to paid
      await tx.update(invoices).set({
        status: "paid",
        updatedAt: new Date(),
      }).where(eq(invoices.id, invoiceId));
      
      // Auto transition booking status to completed
      await tx.update(bookings).set({
        status: "completed",
        updatedAt: new Date(),
      }).where(eq(bookings.id, invoice.bookingId));
    });
    
    return c.json({
      success: true,
      message: "Payment processed and invoice marked as paid successfully.",
      paymentId,
    }, 201);
    
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 2. LIST TRANSACTION HISTORY (Auth required)
// ==========================================
paymentsRouter.get("/", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  
  try {
    let list: any[] = [];
    
    if (user.role === "admin") {
      list = await db.select().from(payments).orderBy(desc(payments.createdAt));
    } else if (user.role === "customer") {
      const custRecord = await db
        .select()
        .from(customers)
        .where(eq(customers.userId, user.id));
        
      if (custRecord.length > 0) {
        list = await db
          .select({
            id: payments.id,
            invoiceId: payments.invoiceId,
            paymentMethod: payments.paymentMethod,
            transactionId: payments.transactionId,
            amount: payments.amount,
            status: payments.status,
            createdAt: payments.createdAt,
          })
          .from(payments)
          .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
          .leftJoin(bookings, eq(invoices.bookingId, bookings.id))
          .where(eq(bookings.customerId, custRecord[0].id))
          .orderBy(desc(payments.createdAt));
      }
    }
    
    return c.json({ success: true, payments: list });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export { paymentsRouter };
