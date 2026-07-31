import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../db.js";
import { aiCopilotSessions, aiCopilotMessages } from "@remotefix/database";
import { requireAuth, AppEnv } from "../middleware/auth.js";
import { AIOrchestrator, EnterprisePredictiveEngine, EnterpriseAutonomousWorkflowEngine, EnterpriseAgentCoordinator } from "../services/ai/index.js";

const aiCopilotRouter = new Hono<AppEnv>();

// ==========================================
// 1. INTERACTIVE AI COPILOT CHAT ASSISTANT
// ==========================================
aiCopilotRouter.post("/chat", requireAuth, async (c) => {
  const dbUrl = c.env?.DATABASE_URL || process.env.DATABASE_URL;

  try {
    const { message, customerName, assetTag, ticketId, sessionId } = await c.req.json();
    if (!message) {
      return c.json({ success: false, error: "User message is required." }, 400);
    }

    const queryLower = message.toLowerCase();
    if (
      queryLower.includes("together") ||
      queryLower.includes("reporting agent") ||
      queryLower.includes("multiple agents") ||
      queryLower.includes("coordinate preventive maintenance")
    ) {
      const userState = c.get("user");
      const userCtx = {
        userId: userState?.id || "usr-101",
        role: userState?.role || "admin",
        tenantId: userState?.tenantId || "tenant-default",
      };
      const maRes = await EnterpriseAgentCoordinator.handleCopilotMultiAgentCommand(message, userCtx);
      return c.json({
        success: true,
        sessionId: sessionId || crypto.randomUUID(),
        reply: maRes.answer,
        agentsInvolved: maRes.agentsInvolved,
        summary: maRes.summary,
        providerUsed: "EnterpriseAgentCoordinator",
        suggestedActions: [
          "View Multi-Agent Observability",
          "Inspect Shared Memory Context",
          "View Multi-Agent Session History",
        ],
      });
    }

    if (
      queryLower.includes("automatically schedule") ||
      queryLower.includes("run predictive maintenance") ||
      queryLower.includes("critical assets") ||
      queryLower.includes("amc renewals") ||
      queryLower.includes("awaiting approval")
    ) {
      const userState = c.get("user");
      const userCtx = {
        userId: userState?.id || "usr-101",
        role: userState?.role || "admin",
        tenantId: userState?.tenantId || "tenant-default",
      };
      const wfRes = await EnterpriseAutonomousWorkflowEngine.handleCopilotWorkflowCommand(message, userCtx);
      return c.json({
        success: true,
        sessionId: sessionId || crypto.randomUUID(),
        reply: wfRes.answer,
        workflowId: wfRes.workflowId,
        status: wfRes.status,
        actionsTaken: wfRes.actionsTaken,
        providerUsed: "EnterpriseAutonomousWorkflowEngine",
        suggestedActions: [
          "View Workflow History",
          "Inspect Pending Approvals",
          "View Executive Metrics",
        ],
      });
    }

    if (
      queryLower.includes("fail") ||
      queryLower.includes("maintenance") ||
      queryLower.includes("declining") ||
      queryLower.includes("spare parts") ||
      queryLower.includes("reorder")
    ) {
      const predRes = await EnterprisePredictiveEngine.handleCopilotPredictiveQuery(message);
      return c.json({
        success: true,
        sessionId: sessionId || crypto.randomUUID(),
        reply: predRes.answer,
        relevantAssets: predRes.relevantAssets,
        recommendations: predRes.recommendations,
        providerUsed: "EnterprisePredictiveEngine",
        suggestedActions: [
          "Schedule Preventive Maintenance",
          "Create Purchase Order for Parts",
          "Review Asset Health Dashboard",
        ],
      });
    }

    // Execute via Enterprise AI Orchestrator
    const response = await AIOrchestrator.execute({
      requestType: "customer_chat",
      promptVariables: { customerName: customerName || "Technician", userMessage: message },
      contextOptions: { customerName, assetTag, ticketId },
      useCache: false,
    });

    const activeSessionId = sessionId || crypto.randomUUID();

    if (dbUrl) {
      const db = getDb(dbUrl);
      await db.insert(aiCopilotMessages).values({
        id: crypto.randomUUID(),
        sessionId: activeSessionId,
        role: "assistant",
        message: response.result.content,
        tokensUsed: response.result.usage.totalTokens,
      });
    }

    return c.json({
      success: true,
      sessionId: activeSessionId,
      reply: response.result.content,
      providerUsed: response.result.providerUsed,
      modelUsed: response.result.modelUsed,
      suggestedActions: [
        "Create On-Site Work Order",
        "Reserve Part (16GB RAM)",
        "Schedule Preventive Maintenance",
      ],
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Copilot chat failed." }, 500);
  }
});

// ==========================================
// 2. AUTOMATED REPAIR & DIAGNOSIS SCRIPT GENERATOR
// ==========================================
aiCopilotRouter.post("/script", requireAuth, async (c) => {
  try {
    const { problemDescription, deviceType, assetTag } = await c.req.json();
    if (!problemDescription) {
      return c.json({ success: false, error: "Problem description is required." }, 400);
    }

    const response = await AIOrchestrator.execute({
      requestType: "diagnosis",
      promptVariables: { subject: problemDescription, description: problemDescription, deviceType: deviceType || "Hardware" },
      contextOptions: { assetTag },
      toolsToExecute: ["get_asset"],
      useCache: true,
    });

    return c.json({
      success: true,
      assetTag: assetTag || "RF-AST-00101",
      diagnosisSummary: response.result.content,
      suggestedCommands: [
        "mdsched.exe /scan",
        "sfc /scannow",
        "DISM /Online /Cleanup-Image /RestoreHealth",
      ],
      requiredParts: ["16GB DDR5 4800MHz SODIMM RAM", "Thermal Paste Compound"],
      providerUsed: response.result.providerUsed,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Repair script generation failed." }, 500);
  }
});

// ==========================================
// 3. EXECUTIVE SLA & ASSET RELIABILITY REPORT GENERATOR
// ==========================================
aiCopilotRouter.post("/executive-report", requireAuth, async (c) => {
  try {
    const { organizationName, period } = await c.req.json();

    const response = await AIOrchestrator.execute({
      requestType: "executive_report",
      promptVariables: { organizationName: organizationName || "Acme Enterprises", period: period || "Q3 2026" },
      useCache: true,
    });

    return c.json({
      success: true,
      organizationName: organizationName || "Acme Enterprises",
      period: period || "Q3 2026",
      slaComplianceRate: "99.4%",
      totalIncidentsResolved: 142,
      aiSummary: response.result.content,
      routeDecision: response.routeDecision,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Executive report generation failed." }, 500);
  }
});

export { aiCopilotRouter };
