import { classifyTicket, diagnoseIncident } from "../apps/api/src/services/aiService.js";
import { AIProviderFactory, MODEL_REGISTRY } from "../apps/api/src/services/ai/index.js";
import { TokenRouterProvider } from "../apps/api/src/services/ai/providers/TokenRouterProvider.js";
import { MockProvider } from "../apps/api/src/services/ai/providers/MockProvider.js";
import { ValidationManager } from "../apps/api/src/services/ai/runtime/ValidationManager.js";
import { AIEngine } from "../apps/api/src/services/ai/runtime/AIEngine.js";

async function runAiPlatformTests() {
  console.log("==================================================");
  console.log("  REMOTEFIX ENTERPRISE AI PLATFORM REFACTOR TESTS");
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

  // 1. Model Registry Inspection
  await assert("Centralized Model Registry Lookup", async () => {
    const meta = MODEL_REGISTRY["moonshotai/kimi-k3-free"];
    if (!meta || meta.provider !== "TokenRouter") throw new Error("TokenRouter model registry entry invalid");
  });

  // 2. Mock Provider Execution
  await assert("Mock AI Provider Completion", async () => {
    const mock = new MockProvider();
    const res = await mock.chat({ prompt: "Test prompt" });
    if (!res.content || res.providerUsed !== "Mock") throw new Error("Mock provider chat failed");
  });

  // 3. TokenRouter Provider Instantiation
  await assert("TokenRouter Provider Healthcheck", async () => {
    const tr = new TokenRouterProvider();
    const healthy = await tr.healthCheck();
    // Validates that environment check executes without crashing
    if (typeof healthy !== "boolean") throw new Error("Healthcheck return type invalid");
  });

  // 4. AI Factory Automatic Failover Engine
  await assert("AI Factory Automatic Failover Execution", async () => {
    const res = await AIProviderFactory.executeWithFailover({ prompt: "Analyze server RAM leak" });
    if (!res.content || !res.providerUsed) throw new Error("AI Factory failover execution failed");
  });

  // 5. High-Level AI Classification Triage
  await assert("AI Ticket Triage Classification (/api/ai/triage)", async () => {
    const triage = await classifyTicket("BSOD crash on Dell XPS", "RAM page fault in nonpaged area");
    if (!triage.category || triage.category !== "Hardware Failure") throw new Error("AI ticket triage classification failed");
  });

  // 6. Lean Code Compliance Check Validation
  await assert("Lean Code Compliance Validation Checks", async () => {
    const cleanCode = `
      import { A } from "mod1";
      import { B } from "mod2";
      export function execute() { return 42; }
    `;
    const cleanReport = ValidationManager.validate(cleanCode, ["lean-code"]);
    if (!cleanReport.valid) throw new Error(`Clean code should be valid: ${cleanReport.errors.join(", ")}`);

    const dirtyCode = `
      import { A } from "mod1";
      import { B } from "mod1"; // duplicate import
      // TODO: implement later
      export class UserWrapper {
        constructor() {}
      }
    `;
    const dirtyReport = ValidationManager.validate(dirtyCode, ["lean-code"]);
    if (dirtyReport.valid) throw new Error("Dirty code should be invalid");
    if (dirtyReport.errors.length < 3) throw new Error(`Expected at least 3 validation errors, got ${dirtyReport.errors.length}`);
  });

  console.log("--------------------------------------------------");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAiPlatformTests().catch((err) => {
  console.error("AI Platform Tests Failed:", err);
  process.exit(1);
});
