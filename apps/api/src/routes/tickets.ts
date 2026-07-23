import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { getDb } from "../db.js";
import { tickets, ticketMessages, customers, engineers, users } from "@remotefix/database";
import { TicketCreateSchema, TicketMessageCreateSchema } from "@remotefix/types";
import { requireAuth, AppEnv } from "../middleware/auth.js";

const ticketsRouter = new Hono<AppEnv>();

// ==========================================
// 1. CREATE SUPPORT TICKET (Customer only)
// ==========================================
ticketsRouter.post("/", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  
  if (user.role !== "customer") {
    return c.json({ success: false, error: "Only customers can open support tickets." }, 403);
  }
  
  try {
    const body = await c.req.json();
    const result = TicketCreateSchema.safeParse(body);
    
    if (!result.success) {
      return c.json({ success: false, error: result.error.errors[0].message }, 400);
    }
    
    // Find customer ID
    const custRecord = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, user.id));
      
    if (custRecord.length === 0) {
      return c.json({ success: false, error: "Customer profile not found." }, 404);
    }
    
    const ticketId = crypto.randomUUID();
    
    await db.insert(tickets).values({
      id: ticketId,
      bookingId: result.data.bookingId || null,
      customerId: custRecord[0].id,
      subject: result.data.subject,
      description: result.data.description,
      priority: result.data.priority || "medium",
      status: "open",
    });
    
    // Create initial thread message from customer description
    await db.insert(ticketMessages).values({
      id: crypto.randomUUID(),
      ticketId,
      senderId: user.id,
      message: result.data.description,
    });
    
    return c.json({
      success: true,
      message: "Support ticket opened successfully.",
      ticketId,
    }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 2. LIST SUPPORT TICKETS (Auth required)
// ==========================================
ticketsRouter.get("/", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  
  try {
    let list: any[] = [];
    
    if (user.role === "admin") {
      list = await db.select().from(tickets).orderBy(desc(tickets.createdAt));
    } else if (user.role === "engineer") {
      const engRecord = await db
        .select()
        .from(engineers)
        .where(eq(engineers.userId, user.id));
        
      if (engRecord.length > 0) {
        // Engineers see tickets assigned to them or unassigned open tickets
        list = await db
          .select()
          .from(tickets)
          .where(eq(tickets.engineerId, engRecord[0].id))
          .orderBy(desc(tickets.createdAt));
      }
    } else if (user.role === "customer") {
      const custRecord = await db
        .select()
        .from(customers)
        .where(eq(customers.userId, user.id));
        
      if (custRecord.length > 0) {
        list = await db
          .select()
          .from(tickets)
          .where(eq(tickets.customerId, custRecord[0].id))
          .orderBy(desc(tickets.createdAt));
      }
    }
    
    return c.json({ success: true, tickets: list });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 3. GET TICKET BY ID + MESSAGES (Auth required)
// ==========================================
ticketsRouter.get("/:id", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  const id = c.req.param("id");
  
  try {
    const ticketList = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id));
      
    if (ticketList.length === 0) {
      return c.json({ success: false, error: "Ticket not found" }, 404);
    }
    
    const ticket = ticketList[0];
    
    // Auth checks
    if (user.role === "customer") {
      const custRecord = await db
        .select()
        .from(customers)
        .where(eq(customers.userId, user.id));
        
      if (custRecord.length === 0 || ticket.customerId !== custRecord[0].id) {
        return c.json({ success: false, error: "Unauthorized access to support ticket." }, 403);
      }
    } else if (user.role === "engineer") {
      const engRecord = await db
        .select()
        .from(engineers)
        .where(eq(engineers.userId, user.id));
        
      if (engRecord.length === 0 || (ticket.engineerId && ticket.engineerId !== engRecord[0].id)) {
        return c.json({ success: false, error: "Unauthorized access to support ticket." }, 403);
      }
    }
    
    // Fetch conversation thread
    const rawMessages = await db
      .select({
        id: ticketMessages.id,
        message: ticketMessages.message,
        createdAt: ticketMessages.createdAt,
        senderId: ticketMessages.senderId,
        senderName: users.fullName,
        senderRole: users.role,
      })
      .from(ticketMessages)
      .leftJoin(users, eq(ticketMessages.senderId, users.id))
      .where(eq(ticketMessages.ticketId, ticket.id))
      .orderBy(ticketMessages.createdAt);
      
    return c.json({
      success: true,
      ticket,
      messages: rawMessages,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 4. ADD MESSAGE TO TICKET / REPLY (Auth required)
// ==========================================
ticketsRouter.post("/:id/messages", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  const id = c.req.param("id");
  
  try {
    const body = await c.req.json();
    const result = TicketMessageCreateSchema.safeParse(body);
    
    if (!result.success) {
      return c.json({ success: false, error: result.error.errors[0].message }, 400);
    }
    
    const ticketList = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id));
      
    if (ticketList.length === 0) {
      return c.json({ success: false, error: "Ticket not found" }, 404);
    }
    
    const ticket = ticketList[0];
    
    // Auth checks
    if (user.role === "customer") {
      const custRecord = await db
        .select()
        .from(customers)
        .where(eq(customers.userId, user.id));
        
      if (custRecord.length === 0 || ticket.customerId !== custRecord[0].id) {
        return c.json({ success: false, error: "Unauthorized." }, 403);
      }
    } else if (user.role === "engineer") {
      const engRecord = await db
        .select()
        .from(engineers)
        .where(eq(engineers.userId, user.id));
        
      if (engRecord.length === 0 || (ticket.engineerId && ticket.engineerId !== engRecord[0].id)) {
        return c.json({ success: false, error: "Unauthorized." }, 403);
      }
    }
    
    const messageId = crypto.randomUUID();
    
    await db.transaction(async (tx) => {
      // Insert message
      await tx.insert(ticketMessages).values({
        id: messageId,
        ticketId: ticket.id,
        senderId: user.id,
        message: result.data.message,
      });
      
      // Update ticket updated time and auto reopen if closed and replied by customer
      const ticketUpdatePayload: any = { updatedAt: new Date() };
      if (user.role === "customer" && ticket.status === "closed") {
        ticketUpdatePayload.status = "open";
      } else if (user.role === "engineer" && ticket.status === "open") {
        ticketUpdatePayload.status = "in_progress";
      }
      
      await tx.update(tickets).set(ticketUpdatePayload).where(eq(tickets.id, ticket.id));
    });
    
    return c.json({
      success: true,
      message: "Reply sent successfully.",
      messageId,
    }, 201);
    
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 5. UPDATE TICKET STATUS / ASSIGNMENT
// ==========================================
ticketsRouter.put("/:id/status", requireAuth, async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const user = c.get("user")!;
  const id = c.req.param("id");
  
  try {
    const { status, engineerId } = await c.req.json();
    
    const ticketList = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id));
      
    if (ticketList.length === 0) {
      return c.json({ success: false, error: "Ticket not found" }, 404);
    }
    
    const ticket = ticketList[0];
    
    if (user.role === "customer") {
      // Customers can only close their own tickets
      const custRecord = await db
        .select()
        .from(customers)
        .where(eq(customers.userId, user.id));
        
      if (custRecord.length === 0 || ticket.customerId !== custRecord[0].id) {
        return c.json({ success: false, error: "Unauthorized" }, 403);
      }
      
      if (status !== "closed") {
        return c.json({ success: false, error: "Customers can only request to close a ticket" }, 400);
      }
      
      await db.update(tickets).set({ status: "closed", updatedAt: new Date() }).where(eq(tickets.id, id));
    } else if (user.role === "engineer") {
      // Engineers can update status of assigned tickets, but cannot reassign
      const engRecord = await db
        .select()
        .from(engineers)
        .where(eq(engineers.userId, user.id));
        
      if (engRecord.length === 0 || ticket.engineerId !== engRecord[0].id) {
        return c.json({ success: false, error: "Unauthorized: Ticket not assigned to you" }, 403);
      }
      
      await db.update(tickets).set({ status, updatedAt: new Date() }).where(eq(tickets.id, id));
    } else if (user.role === "admin") {
      // Admin can update status and assign engineer
      const updatePayload: any = { updatedAt: new Date() };
      if (status) updatePayload.status = status;
      if (engineerId !== undefined) updatePayload.engineerId = engineerId || null;
      
      await db.update(tickets).set(updatePayload).where(eq(tickets.id, id));
    }
    
    return c.json({
      success: true,
      message: "Ticket updated successfully",
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export { ticketsRouter };
