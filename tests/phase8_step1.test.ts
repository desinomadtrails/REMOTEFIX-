import { PromptRegistry, ContextBuilder, ModelRouter, ToolRegistry, AiCache, AIOrchestrator } from "../apps/api/src/services/ai/index.js";

async function runPhase8Step1Tests() {
  console.log("==================================================");
  console.log("  REMOTEFIX PHASE 8 STEP 8.1 - AI ORCHESTRATOR TESTS");
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

  // 1. Prompt Registry Test
  await assert("Prompt Registry Template Lookup & Variable Rendering", async () => {
    const { prompt, template } = PromptRegistry.renderPrompt("triage", { subject: "Laptop Overheating", description: "Fan noise heavy" });
    if (!prompt.includes("Laptop Overheating") || template.version !== "v1.2") {
      throw new Error("Prompt template rendering failed");
    }
  });

  // 2. Context Builder Test
  await assert("Context Builder Metadata Assembly", async () => {
    const sysContext = ContextBuilder.buildSystemContext({ customerName: "Acme Corp", assetTag: "RF-AST-00101" });
    if (!sysContext.includes("Customer: Acme Corp") || !sysContext.includes("RF-AST-00101")) {
      throw new Error("System context assembly failed");
    }
  });

  // 3. Model Router Decision Test
  await assert("Model Router Decision Engine", async () => {
    const route = ModelRouter.route("executive_report");
    if (route.providerName !== "Google Gemini") throw new Error("Long context model routing failed");
  });

  // 4. Tool Registry Test
  await assert("Tool Registry Execution", async () => {
    const res = await ToolRegistry.executeTool("get_asset", { assetTag: "RF-AST-00101" });
    if (!res || res.assetTag !== "RF-AST-00101") throw new Error("Tool execution failed");
  });

  // 5. AI Response Cache Test
  await assert("AI Response Cache Hit Verification", async () => {
    AiCache.clear();
    const promptKey = "Unique Test Query Key 123";
    AiCache.set("tenant-1", "triage", promptKey, {
      content: "Cached Response",
      providerUsed: "Mock",
      modelUsed: "mock-model",
      usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
      latencyMs: 5,
      estimatedCostUsd: 0,
    });

    const cached = AiCache.get("tenant-1", "triage", promptKey);
    if (!cached || !cached.providerUsed.includes("Cached")) throw new Error("AI Cache retrieval failed");
  });

  // 6. AIOrchestrator End-to-End Execution Test
  await assert("AIOrchestrator End-to-End Request Execution (AIOrchestrator.execute)", async () => {
    const response = await AIOrchestrator.execute({
      requestType: "triage",
      promptVariables: { subject: "Network Packet Loss", description: "Switch reboot required" },
      contextOptions: { customerName: "Global Tech Inc" },
      toolsToExecute: ["get_sla"],
      useCache: false,
    });

    if (!response.success || !response.result || !response.promptVersion) {
      throw new Error("AIOrchestrator end-to-end execution failed");
    }
  });

  console.log("--------------------------------------------------");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase8Step1Tests().catch((err) => {
  console.error("Phase 8 Step 8.1 Tests Failed:", err);
  process.exit(1);
});
