import { app } from "../apps/api/src/index.js";
import { signJWT } from "@remotefix/auth";

async function runPhase8Step2Tests() {
  console.log("==================================================");
  console.log("  REMOTEFIX PHASE 8 STEP 8.2 - AI COPILOT TESTS");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  const jwtSecret = process.env.JWT_SECRET || "super-secret-key-min-32-chars-remotefix";
  const token = await signJWT({ sub: "eng-101", email: "tech@remotefix.com", role: "technician", exp: Math.floor(Date.now() / 1000) + 3600 }, jwtSecret);

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

  // 1. Interactive AI Copilot Chat
  await assert("Interactive AI Copilot Chat (/api/ai/copilot/chat)", async () => {
    const res = await app.request("/api/ai/copilot/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ message: "How do I fix a Windows spooler crash on Dell XPS?", assetTag: "RF-AST-00101" }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.reply || !Array.isArray(data.suggestedActions)) throw new Error("Copilot chat failed");
  });

  // 2. Automated Repair & Diagnosis Script Generator
  await assert("Automated Repair Script Generator (/api/ai/copilot/script)", async () => {
    const res = await app.request("/api/ai/copilot/script", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ problemDescription: "BSOD crash on boot", deviceType: "Laptop", assetTag: "RF-AST-00101" }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.suggestedCommands)) throw new Error("Repair script generator failed");
  });

  // 3. Executive SLA & Hardware Reliability Report Generator
  await assert("Executive SLA & Reliability Report Generator (/api/ai/copilot/executive-report)", async () => {
    const res = await app.request("/api/ai/copilot/executive-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ organizationName: "Acme Enterprises", period: "Q3 2026" }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.slaComplianceRate || !data.aiSummary) throw new Error("Executive report generation failed");
  });

  console.log("--------------------------------------------------");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase8Step2Tests().catch((err) => {
  console.error("Phase 8 Step 8.2 Tests Failed:", err);
  process.exit(1);
});
