import { Hono } from "hono";
import { requireAuth, requireRole, AppEnv } from "../middleware/auth.js";
import {
  EnterpriseAgentCoordinator,
  AgentRegistry,
  TaskPlanner,
} from "../services/ai/index.js";
import { UserContext } from "../services/ai/agent/permissionEngine.js";

const aiMultiAgentRouter = new Hono<AppEnv>();

// Require authentication for all multi-agent endpoints
aiMultiAgentRouter.use("*", requireAuth);

/** Helper to construct UserContext from Hono user state */
function getUserContext(c: any): UserContext {
  const user = c.get("user");
  return {
    userId: user?.id || "user-unknown",
    role: user?.role || "admin",
    tenantId: user?.tenantId || "tenant-default",
  };
}

/**
 * 1. Execute Multi-Agent Collaboration Task
 */
aiMultiAgentRouter.post("/coordinate", async (c) => {
  try {
    const { prompt, message } = await c.req.json();
    const promptStr = prompt || message;
    if (!promptStr) {
      return c.json({ success: false, error: "Prompt parameter is required." }, 400);
    }

    const userContext = getUserContext(c);
    const result = await EnterpriseAgentCoordinator.coordinate(promptStr, userContext);

    return c.json({
      success: true,
      sessionId: result.sessionId,
      tenantId: result.tenantId,
      planId: result.planId,
      userPrompt: result.userPrompt,
      agentResultsCount: result.agentResults.length,
      agentResults: result.agentResults,
      aggregatedSummary: result.aggregatedSummary,
      decisionLog: result.decisionLog,
      durationMs: result.durationMs,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to coordinate multi-agent execution." }, 500);
  }
});

/**
 * 2. List Registered Specialized Agents
 */
aiMultiAgentRouter.get("/registry", async (c) => {
  try {
    const agents = AgentRegistry.listAgents();

    return c.json({
      success: true,
      count: agents.length,
      agents,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to fetch agent registry." }, 500);
  }
});

/**
 * 3. Decompose Goal into Multi-Agent Execution Plan (Dry-run / Inspection)
 */
aiMultiAgentRouter.post("/plan", async (c) => {
  try {
    const { prompt } = await c.req.json();
    if (!prompt) {
      return c.json({ success: false, error: "Prompt parameter is required." }, 400);
    }

    const userContext = getUserContext(c);
    const plan = TaskPlanner.decomposeGoal(prompt, userContext);

    return c.json({
      success: true,
      tenantId: userContext.tenantId,
      plan,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to generate multi-agent plan." }, 500);
  }
});

/**
 * 4. Retrieve Tenant-Scoped Session History
 */
aiMultiAgentRouter.get("/history", async (c) => {
  try {
    const userContext = getUserContext(c);
    const history = EnterpriseAgentCoordinator.listHistory(userContext.tenantId);

    return c.json({
      success: true,
      tenantId: userContext.tenantId,
      count: history.length,
      history,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to fetch multi-agent session history." }, 500);
  }
});

/**
 * 5. Multi-Agent Observability Metrics
 */
aiMultiAgentRouter.get("/observability", requireRole(["admin", "manager"]), async (c) => {
  try {
    const userContext = getUserContext(c);
    const metrics = EnterpriseAgentCoordinator.getObservabilityMetrics(userContext.tenantId);

    return c.json({
      success: true,
      tenantId: userContext.tenantId,
      metrics,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to fetch multi-agent observability metrics." }, 500);
  }
});

export { aiMultiAgentRouter };
