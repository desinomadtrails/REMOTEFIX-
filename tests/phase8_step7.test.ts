import app from "../apps/api/src/index.js";
import {
  EnterpriseAgentCoordinator,
  AgentRegistry,
  TaskPlanner,
  AgentGovernanceEngine,
  AgentCommunicationBus,
  AgentSessionManager,
} from "../apps/api/src/services/ai/index.js";
import { UserContext } from "../apps/api/src/services/ai/agent/permissionEngine.js";
import { signJWT } from "@remotefix/auth";

async function runPhase8Step7MultiAgentTests() {
  console.log("==================================================");
  console.log("  REMOTEFIX PHASE 8 STEP 8.7 - MULTI-AGENT PLATFORM TESTS");
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

  // 1. Agent Registry Test
  await assert("Agent Registry (10 Specialized Enterprise Agents)", async () => {
    const agents = AgentRegistry.listAgents();
    if (agents.length !== 10) {
      throw new Error(`Expected 10 specialized agents registered, got ${agents.length}`);
    }

    const diagAgent = AgentRegistry.getAgent("Diagnostic Agent");
    if (!diagAgent || !diagAgent.allowedTools.includes("search_assets")) {
      throw new Error("Diagnostic Agent definition missing or misconfigured.");
    }
  });

  // 2. Task Planner Goal Decomposition Test
  await assert("Task Planner Goal Decomposition (Sequential & Parallel Sub-Tasks)", async () => {
    const plan = TaskPlanner.decomposeGoal("Ask diagnostics and inventory agents together.", adminUser);
    if (!plan.planId || plan.subTasks.length < 2) {
      throw new Error("Task Planner failed to decompose goal into multiple sub-tasks.");
    }
    const agentsAssigned = plan.subTasks.map((st) => st.assignedAgent);
    if (!agentsAssigned.includes("Diagnostic Agent") || !agentsAssigned.includes("Inventory Agent")) {
      throw new Error("Task Planner assigned incorrect agents for diagnostic and inventory request.");
    }
  });

  // 3. Agent Governance Engine Enforcement Test
  await assert("Agent Governance Engine (Tool Authorization & Tenant Isolation)", async () => {
    const allowedCheck = AgentGovernanceEngine.validateAgentExecution("Diagnostic Agent", "search_assets", adminUser);
    if (!allowedCheck.allowed) throw new Error("Governance engine blocked valid tool execution.");

    const blockedCheck = AgentGovernanceEngine.validateAgentExecution("Diagnostic Agent", "generate_invoice", adminUser);
    if (blockedCheck.allowed) throw new Error("Governance engine failed to block unauthorized tool execution.");
  });

  // 4. Agent Communication Bus Test
  await assert("Agent Communication Bus (Message Publishing & Routing)", async () => {
    AgentCommunicationBus.publish({
      messageId: "msg-test-01",
      senderAgent: "Diagnostic Agent",
      targetAgent: "Inventory Agent",
      type: "request",
      payload: { requiredPart: "16GB RAM" },
      timestamp: new Date().toISOString(),
    });

    const msgs = AgentCommunicationBus.getMessagesForAgent("Inventory Agent");
    if (msgs.length === 0 || msgs[0].payload.requiredPart !== "16GB RAM") {
      throw new Error("Agent Communication Bus failed to deliver targeted message.");
    }
  });

  // 5. Shared Enterprise Memory & Session Isolation Test
  await assert("Shared Enterprise Memory & Multi-Tenant Session Isolation", async () => {
    const sessionId = AgentSessionManager.createSession("tenant-acme");
    AgentSessionManager.updateContext(sessionId, "diagnosedPart", "NVMe SSD 1TB", "tenant-acme");

    const ctxAcme = AgentSessionManager.getContext(sessionId, "tenant-acme");
    if (ctxAcme.diagnosedPart !== "NVMe SSD 1TB") throw new Error("Shared memory update failed.");

    const ctxCrossTenant = AgentSessionManager.getContext(sessionId, "tenant-competitor");
    if (Object.keys(ctxCrossTenant).length > 0) throw new Error("Cross-tenant shared memory isolation leak.");
  });

  // 6. Enterprise Agent Coordinator Collaboration Test
  await assert("Enterprise Agent Coordinator Multi-Agent Execution & Result Aggregation", async () => {
    const result = await EnterpriseAgentCoordinator.coordinate("Prepare executive report using reporting agent.", adminUser);

    if (!result.sessionId || result.agentResults.length < 2 || !result.aggregatedSummary) {
      throw new Error("Multi-Agent Coordinator execution or result aggregation failed.");
    }
    if (result.decisionLog.confidence < 0.9) {
      throw new Error("Multi-Agent Decision Log confidence below baseline.");
    }
  });

  // 7. REST API Endpoints Verification Test
  await assert("Multi-Agent Platform REST API Endpoints (/api/ai/agents/*)", async () => {
    // POST /coordinate
    const resCoord = await app.request("/api/ai/agents/coordinate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ prompt: "Find root cause using multiple agents." }),
    });
    if (resCoord.status !== 200) throw new Error(`Coordinate endpoint returned status ${resCoord.status}`);
    const jsonCoord = await resCoord.json();
    if (!jsonCoord.success || !jsonCoord.sessionId) throw new Error("Invalid coordinate response JSON.");

    // GET /registry
    const resReg = await app.request("/api/ai/agents/registry", {
      method: "GET",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (resReg.status !== 200) throw new Error(`Registry endpoint returned status ${resReg.status}`);
    const jsonReg = await resReg.json();
    if (!jsonReg.success || jsonReg.count !== 10) throw new Error("Invalid registry response JSON.");

    // GET /observability
    const resObs = await app.request("/api/ai/agents/observability", {
      method: "GET",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (resObs.status !== 200) throw new Error(`Observability endpoint returned status ${resObs.status}`);
    const jsonObs = await resObs.json();
    if (!jsonObs.success || jsonObs.metrics.totalMultiAgentSessions === undefined) throw new Error("Invalid observability response JSON.");
  });

  // 8. Copilot Multi-Agent Command Integration Test
  await assert("Copilot Multi-Agent Natural Language Command Integration", async () => {
    const copilotRes = await EnterpriseAgentCoordinator.handleCopilotMultiAgentCommand("Ask diagnostics and inventory agents together.", adminUser);
    if (!copilotRes.answer || copilotRes.agentsInvolved.length < 2) {
      throw new Error("Copilot multi-agent handler failed to execute multi-agent task.");
    }
  });

  // 9. RBAC Security & Endpoint Restriction Test
  await assert("RBAC Security & Observability Access Restrictions", async () => {
    // Technician attempting to access admin multi-agent observability metrics should get 403 Forbidden
    const resForbidden = await app.request("/api/ai/agents/observability", {
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

runPhase8Step7MultiAgentTests().catch((err) => {
  console.error("Phase 8 Step 8.7 Multi-Agent Tests Failed:", err);
  process.exit(1);
});
