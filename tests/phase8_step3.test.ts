import { EnterpriseToolRegistry, AIPermissionEngine, AIWorkflowEngine, AIAgentExecutor } from "../apps/api/src/services/ai/index.js";

async function runPhase8Step3Tests() {
  console.log("==================================================");
  console.log("  REMOTEFIX PHASE 8 STEP 8.3 - AI AGENT TESTS");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  const adminUser = { userId: "admin-1", role: "admin", tenantId: "tenant-1" };
  const techUser = { userId: "tech-1", role: "technician", tenantId: "tenant-1" };
  const custUser = { userId: "cust-1", role: "customer", tenantId: "tenant-1" };

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

  // 1. Tool Registry Verification
  await assert("Enterprise Tool Registry Discovery", async () => {
    const tools = EnterpriseToolRegistry.listTools();
    if (tools.length < 8) throw new Error("Expected at least 8 enterprise tool adapters");
  });

  // 2. Permission Engine RBAC Check
  await assert("Permission Engine Role Rejection Check", async () => {
    const generateInvoiceTool = EnterpriseToolRegistry.getTool("generate_invoice")!;
    const check = AIPermissionEngine.validate(generateInvoiceTool, custUser);
    if (check.allowed) throw new Error("Customer role should be blocked from invoice generation");
  });

  // 3. High-Risk Confirmation Workflow
  await assert("High-Risk Confirmation Required Check", async () => {
    const res = await EnterpriseToolRegistry.executeTool("close_ticket", { ticketId: "TCK-101", notes: "Closed" }, techUser);
    if (res.status !== "requires_confirmation") throw new Error("Unconfirmed high-risk action should require confirmation");
  });

  // 4. Confirmed Execution Test
  await assert("Confirmed Execution of High-Risk Action", async () => {
    const res = await EnterpriseToolRegistry.executeTool("close_ticket", { ticketId: "TCK-101", notes: "Closed", confirmed: true }, techUser);
    if (res.status !== "closed") throw new Error("Confirmed action execution failed");
  });

  // 5. AIAgentExecutor Single Tool Execution
  await assert("AIAgentExecutor Single Tool Execution (create_ticket)", async () => {
    const res = await AIAgentExecutor.executeAction("create_ticket", { subject: "Printer offline", priority: "high" }, techUser);
    if (!res.success || !res.result?.ticketId) throw new Error("Agent tool execution failed");
  });

  // 6. Multi-Step Sequential Workflow Execution
  await assert("Multi-Step Workflow Engine Execution (6-Step Chain)", async () => {
    const workflowResult = await AIWorkflowEngine.executeWorkflow(
      [
        { stepId: "step1", toolId: "search_assets", args: { assetTag: "RF-AST-00101" } },
        { stepId: "step2", toolId: "create_ticket", args: { subject: "Laptop Blue Screen", priority: "urgent" } },
        { stepId: "step3", toolId: "find_technician", args: {} },
        { stepId: "step4", toolId: "assign_technician", args: { ticketId: "TCK-999", engineerId: "eng-101" } },
        { stepId: "step5", toolId: "reserve_parts", args: { partName: "16GB RAM SODIMM", quantity: 1 } },
        { stepId: "step6", toolId: "send_notification", args: { recipient: "customer@acme.com" } },
      ],
      techUser
    );

    if (!workflowResult.success || workflowResult.stepsExecuted.length !== 6) {
      throw new Error(`Workflow execution failed: ${workflowResult.error}`);
    }
  });

  console.log("--------------------------------------------------");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase8Step3Tests().catch((err) => {
  console.error("Phase 8 Step 8.3 Tests Failed:", err);
  process.exit(1);
});
