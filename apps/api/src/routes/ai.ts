import { Hono } from "hono";
import { classifyTicket, diagnoseIncident } from "../services/aiService.js";
import { requireAuth, AppEnv } from "../middleware/auth.js";

const aiRouter = new Hono<AppEnv>();

// Require auth for AI Copilot features
aiRouter.use("*", requireAuth);

// ==========================================
// 1. AI TICKET CLASSIFICATION & TRIAGE
// ==========================================
aiRouter.post("/triage", async (c) => {
  try {
    const { subject, description } = await c.req.json();
    if (!subject || !description) {
      return c.json({ success: false, error: "Subject and description are required for AI triage." }, 400);
    }

    const result = await classifyTicket(subject, description);
    return c.json({ success: true, triage: result });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "AI triage failed" }, 500);
  }
});

// ==========================================
// 2. AI INCIDENT DIAGNOSIS & REPAIR SCRIPT
// ==========================================
aiRouter.post("/diagnose", async (c) => {
  try {
    const { subject, description, deviceType } = await c.req.json();
    if (!subject || !description) {
      return c.json({ success: false, error: "Subject and description are required for AI diagnosis." }, 400);
    }

    const diagnosis = await diagnoseIncident(subject, description, deviceType);
    return c.json({ success: true, diagnosis });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "AI diagnosis failed" }, 500);
  }
});

export { aiRouter };
