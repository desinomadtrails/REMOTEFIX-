import { app } from "../apps/api/src/index.js";

async function runPhase6Step3Tests() {
  console.log("==================================================");
  console.log("  REMOTEFIX PHASE 6 STEP 6.3 - ASSETS & HISTORY TESTS");
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

  // 1. Fetch All Customer Assets
  await assert("Fetch Customer Assets List (/api/customer/assets)", async () => {
    const res = await app.request("/api/customer/assets");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.assets)) throw new Error("Assets list response invalid");
  });

  // 2. Fetch Single Asset Details & Service History
  await assert("Fetch Asset Details & History Timeline (/api/customer/assets/asset-101)", async () => {
    const res = await app.request("/api/customer/assets/asset-101");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.asset || !Array.isArray(data.history)) throw new Error("Asset details response invalid");
  });

  // 3. Create Support Request for Specific Asset
  await assert("Create Asset Support Request (/api/customer/assets/asset-101/service-request)", async () => {
    const res = await app.request("/api/customer/assets/asset-101/service-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemDescription: "Overheating CPU under heavy render workload", priority: "high" }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.ticketId) throw new Error("Asset service request failed");
  });

  console.log("--------------------------------------------------");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase6Step3Tests().catch((err) => {
  console.error("Phase 6 Step 6.3 Tests Failed:", err);
  process.exit(1);
});
