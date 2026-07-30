import { Hono } from "hono";
import { classifyTicket, diagnoseIncident, smartAssignTechnician, predictHardwareFailure } from "../services/aiService.js";
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

// ==========================================
// 3. AI SMART TECHNICIAN AUTO-ASSIGNMENT
// ==========================================
aiRouter.post("/smart-assign", async (c) => {
  try {
    const { problemDescription, type, engineers } = await c.req.json();
    if (!problemDescription || !Array.isArray(engineers)) {
      return c.json({ success: false, error: "Problem description and engineers list required." }, 400);
    }

    const recommendation = await smartAssignTechnician({ problemDescription, type }, engineers);
    return c.json({ success: true, recommendation });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Smart assignment failed" }, 500);
  }
});

// ==========================================
// 4. AI PREDICTIVE HARDWARE MAINTENANCE
// ==========================================
aiRouter.post("/predict-maintenance", async (c) => {
  try {
    const { asset } = await c.req.json();
    if (!asset || !asset.name) {
      return c.json({ success: false, error: "Asset details required for predictive Maintenance." }, 400);
    }

    const prediction = await predictHardwareFailure(asset);
    return c.json({ success: true, prediction });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Predictive maintenance failed" }, 500);
  }
});

export { aiRouter };
