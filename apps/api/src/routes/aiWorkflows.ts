import { Hono } from "hono";
import { requireAuth, requireRole, AppEnv } from "../middleware/auth.js";
import {
  EnterpriseAutonomousWorkflowEngine,
  WorkflowPlanner,
  EventTriggerType,
  WorkflowTemplateName,
} from "../services/ai/index.js";
import { UserContext } from "../services/ai/agent/permissionEngine.js";

const aiWorkflowsRouter = new Hono<AppEnv>();

// Require authentication for all workflow endpoints
aiWorkflowsRouter.use("*", requireAuth);

/** Helper to construct UserContext from Hono user state */
function getUserContext(c: any): UserContext {
  const user = c.get("user");
  return {
    userId: user?.id || "user-unknown",
    role: user?.role || "technician",
    tenantId: user?.tenantId || "tenant-default",
  };
}

/**
 * 1. Trigger Autonomous Workflow Execution
 */
aiWorkflowsRouter.post("/trigger", async (c) => {
  try {
    const payload = await c.req.json();
    const triggerSource: EventTriggerType = payload.triggerSource || "Manual Trigger";
    const userContext = getUserContext(c);

    const result = await EnterpriseAutonomousWorkflowEngine.processTrigger(triggerSource, payload, userContext);

    return c.json({
      success: true,
      tenantId: userContext.tenantId,
      workflowId: result.plan.workflowId,
      templateName: result.plan.templateName,
      status: result.history.status,
      expectedOutcome: result.plan.expectedOutcome,
      history: result.history,
      decisionLog: result.decisionLog,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to trigger autonomous workflow." }, 500);
  }
});

/**
 * 2. Create Workflow Execution Plan Only (Dry-run / Inspection)
 */
aiWorkflowsRouter.post("/plan", async (c) => {
  try {
    const payload = await c.req.json();
    const templateName: WorkflowTemplateName = payload.templateName || "Predictive Maintenance";
    const triggerSource: EventTriggerType = payload.triggerSource || "Manual Trigger";
    const userContext = getUserContext(c);

    const plan = WorkflowPlanner.createPlan(templateName, triggerSource, payload, userContext);

    return c.json({
      success: true,
      tenantId: userContext.tenantId,
      plan,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to generate workflow plan." }, 500);
  }
});

/**
 * 3. Retrieve Tenant-Scoped Workflow History & AI Decision Logs
 */
aiWorkflowsRouter.get("/history", async (c) => {
  try {
    const userContext = getUserContext(c);
    const history = EnterpriseAutonomousWorkflowEngine.listHistory(userContext.tenantId);
    const decisionLogs = EnterpriseAutonomousWorkflowEngine.listDecisionLogs(userContext.tenantId);

    return c.json({
      success: true,
      tenantId: userContext.tenantId,
      count: history.length,
      history,
      decisionLogs,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to fetch workflow history." }, 500);
  }
});

/**
 * 4. List Pending Approvals
 */
aiWorkflowsRouter.get("/pending-approvals", requireRole(["admin", "manager", "dispatcher", "finance"]), async (c) => {
  try {
    const userContext = getUserContext(c);
    const pending = EnterpriseAutonomousWorkflowEngine.listPendingApprovals(userContext.tenantId);

    return c.json({
      success: true,
      tenantId: userContext.tenantId,
      count: pending.length,
      pendingApprovals: pending,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to fetch pending approvals." }, 500);
  }
});

/**
 * 5. Approve or Reject Pending Workflow Action
 */
aiWorkflowsRouter.post("/approve", requireRole(["admin", "manager", "dispatcher", "finance"]), async (c) => {
  try {
    const { approvalId, approved, reason } = await c.req.json();
    if (!approvalId || approved === undefined) {
      return c.json({ success: false, error: "approvalId and approved boolean parameters are required." }, 400);
    }

    const userContext = getUserContext(c);
    const resolved = EnterpriseAutonomousWorkflowEngine.resolveApproval(approvalId, Boolean(approved), userContext, reason);

    return c.json({
      success: true,
      approvalId: resolved.approvalId,
      status: resolved.status,
      resolvedBy: resolved.resolvedBy,
      resolvedAt: resolved.resolvedAt,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to resolve approval request." }, 500);
  }
});

/**
 * 6. Control Workflow State (Pause / Resume / Cancel)
 */
aiWorkflowsRouter.post("/control", requireRole(["admin", "manager"]), async (c) => {
  try {
    const { workflowId, action } = await c.req.json();
    if (!workflowId || !action) {
      return c.json({ success: false, error: "workflowId and action ('pause' | 'resume' | 'cancel') are required." }, 400);
    }

    let state: "running" | "paused" | "cancelled" = "running";
    if (action === "pause") state = "paused";
    else if (action === "cancel") state = "cancelled";
    else if (action === "resume") state = "running";

    EnterpriseAutonomousWorkflowEngine.setControlState(workflowId, state);

    return c.json({
      success: true,
      workflowId,
      state,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to update workflow control state." }, 500);
  }
});

/**
 * 7. Retrieve Workflow Observability Metrics
 */
aiWorkflowsRouter.get("/observability", requireRole(["admin", "manager"]), async (c) => {
  try {
    const userContext = getUserContext(c);
    const metrics = EnterpriseAutonomousWorkflowEngine.getObservabilityMetrics(userContext.tenantId);

    return c.json({
      success: true,
      tenantId: userContext.tenantId,
      metrics,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to fetch workflow observability metrics." }, 500);
  }
});

export { aiWorkflowsRouter };
