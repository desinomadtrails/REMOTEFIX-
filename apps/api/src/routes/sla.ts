import { Hono } from "hono";
import { eq, lt, and } from "drizzle-orm";
import { getDb } from "../db.js";
import { slaPolicies, tickets, bookings } from "@remotefix/database";
import { SlaPolicyCreateSchema } from "@remotefix/types";
import { requireAuth, requireRole, AppEnv } from "../middleware/auth.js";
import { sendEmail } from "../services/emailService.js";

const slaRouter = new Hono<AppEnv>();

// Apply admin auth middleware
slaRouter.use("*", requireAuth, requireRole(["admin"]));

// ==========================================
// 1. GET ALL SLA POLICIES
// ==========================================
slaRouter.get("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const policies = await db.select().from(slaPolicies);
    return c.json({ success: true, policies });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to fetch SLA policies" }, 500);
  }
});

// ==========================================
// 2. CREATE SLA POLICY
// ==========================================
slaRouter.post("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const body = await c.req.json();
    const result = SlaPolicyCreateSchema.safeParse(body);

    if (!result.success) {
      return c.json({ success: false, error: result.error.errors[0].message }, 400);
    }

    const { name, priority, responseBufferMinutes, resolutionBufferMinutes, escalationEmail, isDefault } = result.data;

    // Check priority uniqueness
    const existing = await db.select().from(slaPolicies).where(eq(slaPolicies.priority, priority));
    if (existing.length > 0) {
      return c.json({ success: false, error: `SLA policy for priority '${priority}' already exists.` }, 400);
    }

    const newSlaId = crypto.randomUUID();
    await db.insert(slaPolicies).values({
      id: newSlaId,
      name,
      priority,
      responseBufferMinutes,
      resolutionBufferMinutes,
      escalationEmail: escalationEmail || null,
      isDefault: isDefault ? true : false,
    });

    const created = await db.select().from(slaPolicies).where(eq(slaPolicies.id, newSlaId));
    return c.json({ success: true, policy: created[0] }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to create SLA policy" }, 500);
  }
});

// ==========================================
// 3. AUTOMATED SLA BREACH EVALUATOR
// ==========================================
slaRouter.post("/evaluate", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const now = new Date();

  try {
    // Find un-resolved tickets past their resolution due date that are not yet flagged breached
    const breachedTickets = await db
      .select()
      .from(tickets)
      .where(and(eq(tickets.isSlaBreached, false), lt(tickets.resolutionDueAt, now)));

    let breachCount = 0;
    for (const ticket of breachedTickets) {
      await db.update(tickets).set({ isSlaBreached: true }).where(eq(tickets.id, ticket.id));
      breachCount++;

      // Dispatch escalation email if policy specifies an escalation contact
      if (ticket.slaPolicyId) {
        const policyList = await db.select().from(slaPolicies).where(eq(slaPolicies.id, ticket.slaPolicyId));
        if (policyList.length > 0 && policyList[0].escalationEmail) {
          await sendEmail({
            to: policyList[0].escalationEmail,
            subject: `[SLA BREACH ALERT] Ticket #${ticket.id.slice(0, 8)} Overdue`,
            html: `
              <h2>⚠️ Service Level Agreement Breach Warning</h2>
              <p>Ticket <strong>#${ticket.id.slice(0, 8)}</strong> (${ticket.subject}) has breached its target SLA resolution deadline.</p>
              <p><strong>Priority:</strong> ${ticket.priority.toUpperCase()}</p>
              <p><strong>Target Deadline:</strong> ${ticket.resolutionDueAt}</p>
              <p>Please log in to the RemoteFix Admin Suite immediately to re-assign or expedite resolution.</p>
            `,
          });
        }
      }
    }

    return c.json({ success: true, message: `SLA Evaluation Complete. Flagged ${breachCount} breached tickets.`, breachCount });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to evaluate SLAs" }, 500);
  }
});

export { slaRouter };
