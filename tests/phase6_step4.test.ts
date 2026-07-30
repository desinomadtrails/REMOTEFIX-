import { app } from "../apps/api/src/index.js";

async function runPhase6Step4Tests() {
  console.log("==================================================");
  console.log("  REMOTEFIX PHASE 6 STEP 6.4 - CSAT & KB TESTS");
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

  // 1. Submit Ticket CSAT Feedback
  await assert("Submit Customer CSAT Feedback (/api/customer/feedback)", async () => {
    const res = await app.request("/api/customer/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: "b-101", rating: 5, feedbackText: "Outstanding technician performance!", technicianRating: 5 }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error("Feedback submission failed");
  });

  // 2. Fetch CSAT Summary Score
  await assert("Fetch CSAT Rating Summary (/api/customer/feedback/summary)", async () => {
    const res = await app.request("/api/customer/feedback/summary");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.csatScore) throw new Error("CSAT summary response invalid");
  });

  // 3. Search Knowledge Base Articles
  await assert("Search Knowledge Base Articles (/api/customer/feedback/kb?query=spooler)", async () => {
    const res = await app.request("/api/customer/feedback/kb?query=spooler");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.articles)) throw new Error("KB articles search invalid");
  });

  console.log("--------------------------------------------------");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase6Step4Tests().catch((err) => {
  console.error("Phase 6 Step 6.4 Tests Failed:", err);
  process.exit(1);
});
