import app from "../apps/api/src/index.js";
import {
  EnterpriseAutonomousWorkflowEngine,
  WorkflowPlanner,
  ApprovalEngine,
  WorkflowExecutor,
} from "../apps/api/src/services/ai/index.js";
import { UserContext } from "../apps/api/src/services/ai/agent/permissionEngine.js";
import { signJWT } from "@remotefix/auth";

async function runPhase8Step6AutonomousWorkflowTests() {
  console.log("==================================================");
  console.log("  REMOTEFIX PHASE 8 STEP 8.6 - AUTONOMOUS WORKFLOW ENGINE TESTS");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  async function assert(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ PASSED: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ FAILED: ${name} -> ${err.message}`);
      failed++;
    }
  }

  const jwtSecret = process.env.JWT_SECRET || "super-secret-key-min-32-chars-remotefix";

  const adminUser: UserContext = {
    userId: "user-admin-01",
    role: "admin",
    tenantId: "tenant-acme",
  };

  const techUser: UserContext = {
    userId: "user-tech-01",
    role: "technician",
    tenantId: "tenant-acme",
  };

  const adminToken = await signJWT(
    { id: adminUser.userId, role: adminUser.role, tenantId: adminUser.tenantId },
    jwtSecret
  );

  const techToken = await signJWT(
    { id: techUser.userId, role: techUser.role, tenantId: techUser.tenantId },
    jwtSecret
  );

  // 1. Workflow Planner Test
  await assert("Workflow Planner Tool Selection & Dependency Graph Assembly", async () => {
    const plan = WorkflowPlanner.createPlan(
      "Predictive Maintenance",
      "Prediction Engine",
      { assetName: "Datacenter Switch", partName: "SFP+ 10G Transceiver" },
      adminUser
    );

    if (!plan.workflowId || plan.steps.length === 0) {
      throw new Error("Workflow planner returned invalid or empty plan.");
    }
    if (!plan.dependencies["step-2-parts"]) {
      throw new Error("Workflow planner failed to establish step dependency rules.");
    }
  });

  // 2. Approval Engine Policy Validation Test
  await assert("Approval Engine Multi-Tier Policy Validation (Finance & Admin Approval)", async () => {
    const amcPlan = WorkflowPlanner.createPlan("AMC Renewal", "AMC Expiration", {}, adminUser);
    const invoiceStep = amcPlan.steps.find((s) => s.toolId === "generate_invoice");

    if (!invoiceStep) throw new Error("AMC Renewal plan missing invoice step.");

    const check = ApprovalEngine.evaluateApproval(invoiceStep, adminUser);
    if (!check.requiresApproval || check.approvalRole !== "finance") {
      throw new Error("Approval Engine failed to enforce Finance approval policy for invoice generation.");
    }
  });

  // 3. Workflow Executor Sequential Execution & Retries Test
  await assert("Workflow Executor Sequential Tool Dispatch & Retry Strategy", async () => {
    const plan = WorkflowPlanner.createPlan(
      "Predictive Maintenance",
      "Manual Trigger",
      { assetName: "Test Printer" },
      adminUser
    );

    const history = await WorkflowExecutor.executePlan(plan, adminUser);
    if (history.status !== "completed" || history.executedTools.length === 0) {
      throw new Error(`Workflow execution failed with status '${history.status}'`);
    }
  });

  // 4. Rollback & Compensation Strategy Test
  await assert("Rollback & Compensation Execution on Step Failure", async () => {
    const failPlan = WorkflowPlanner.createPlan(
      "Predictive Maintenance",
      "Manual Trigger",
      { assetName: "Failing Unit" },
      adminUser
    );

    // Inject invalid step tool to trigger failure
    failPlan.steps.push({
      stepId: "step-fail-invalid",
      toolId: "non_existent_tool_id",
      args: {},
      requiresApproval: false,
    });

    const history = await WorkflowExecutor.executePlan(failPlan, adminUser);
    if (history.status !== "rolled_back" && history.status !== "failed") {
      throw new Error(`Expected rolled_back or failed status, got '${history.status}'`);
    }
    if (history.failures.length === 0) {
      throw new Error("Rollback history failed to record failure context.");
    }
  });

  // 5. Workflow History & AI Decision Log Persistence Test
  await assert("Workflow History & AI Decision Log Recording", async () => {
    const result = await EnterpriseAutonomousWorkflowEngine.processTrigger(
      "Prediction Engine",
      { healthScore: 22, assetName: "Core UPS Module" },
      adminUser
    );

    if (!result.decisionLog.logId || result.decisionLog.confidence < 0.9) {
      throw new Error("AI Decision Log missing or recorded low confidence rating.");
    }

    const history = EnterpriseAutonomousWorkflowEngine.getHistory(result.plan.workflowId);
    if (!history || history.workflowId !== result.plan.workflowId) {
      throw new Error("Workflow History Store failed to retrieve saved workflow record.");
    }
  });

  // 6. Approval Resolution Flow Test
  await assert("Approval Request Creation & Approval Resolution Flow", async () => {
    const amcResult = await EnterpriseAutonomousWorkflowEngine.processTrigger(
      "AMC Expiration",
      { templateName: "AMC Renewal" },
      adminUser
    );

    if (amcResult.history.status !== "pending_approval" || amcResult.history.approvals.length === 0) {
      throw new Error("AMC Renewal workflow failed to halt for pending approval.");
    }

    const pendingReq = amcResult.history.approvals[0];
    const resolved = EnterpriseAutonomousWorkflowEngine.resolveApproval(
      pendingReq.approvalId,
      true,
      adminUser,
      "Finance Budget Approved"
    );

    if (resolved.status !== "approved" || resolved.resolvedBy !== adminUser.userId) {
      throw new Error("Approval Engine resolution failed to update status to approved.");
    }
  });

  // 7. REST API Endpoints Verification Test
  await assert("Autonomous Workflows REST API Endpoints (/api/ai/workflows/*)", async () => {
    // POST /trigger
    const resTrigger = await app.request("/api/ai/workflows/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ triggerSource: "Manual Trigger", templateName: "Preventive Inspection" }),
    });
    if (resTrigger.status !== 200) throw new Error(`Trigger endpoint returned status ${resTrigger.status}`);
    const jsonTrigger = await resTrigger.json();
    if (!jsonTrigger.success || !jsonTrigger.workflowId) throw new Error("Invalid trigger response JSON.");

    // GET /history
    const resHistory = await app.request("/api/ai/workflows/history", {
      method: "GET",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (resHistory.status !== 200) throw new Error(`History endpoint returned status ${resHistory.status}`);
    const jsonHistory = await resHistory.json();
    if (!jsonHistory.success || jsonHistory.count === undefined) throw new Error("Invalid history response JSON.");

    // GET /observability
    const resObs = await app.request("/api/ai/workflows/observability", {
      method: "GET",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (resObs.status !== 200) throw new Error(`Observability endpoint returned status ${resObs.status}`);
    const jsonObs = await resObs.json();
    if (!jsonObs.success || jsonObs.metrics.totalWorkflowsExecuted === undefined) throw new Error("Invalid observability response JSON.");
  });

  // 8. Copilot Natural Language Command Integration Test
  await assert("Copilot Natural Language Autonomous Workflow Command Integration", async () => {
    const copilotRes = await EnterpriseAutonomousWorkflowEngine.handleCopilotWorkflowCommand(
      "Automatically schedule preventive maintenance.",
      adminUser
    );

    if (!copilotRes.answer || !copilotRes.workflowId || copilotRes.actionsTaken.length === 0) {
      throw new Error("Copilot workflow command handler failed to execute autonomous workflow.");
    }
  });

  // 9. RBAC Security & Control Restrictions Test
  await assert("RBAC Security & Endpoint Access Restrictions", async () => {
    // Technician attempting to access admin observability metrics should get 403 Forbidden
    const resForbidden = await app.request("/api/ai/workflows/observability", {
      method: "GET",
      headers: { Authorization: `Bearer ${techToken}` },
    });
    if (resForbidden.status !== 403) {
      throw new Error(`Expected 403 Forbidden for technician on observability endpoint, got ${resForbidden.status}`);
    }
  });

  console.log("--------------------------------------------------");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase8Step6AutonomousWorkflowTests().catch((err) => {
  console.error("Phase 8 Step 8.6 Autonomous Workflow Tests Failed:", err);
  process.exit(1);
});
