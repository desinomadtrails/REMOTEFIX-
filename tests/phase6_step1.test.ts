import { app } from "../apps/api/src/index.js";

async function runPhase6Step1Tests() {
  console.log("==================================================");
  console.log("  REMOTEFIX PHASE 6 STEP 6.1 - CUSTOMER PORTAL TESTS");
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

  // 1. Dispatch Magic Link OTP
  let demoToken = "";
  await assert("Passwordless Magic Link & OTP Dispatch (/api/customer/magic-link)", async () => {
    const res = await app.request("/api/customer/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "guest.customer@example.com" }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.token) throw new Error("Magic link dispatch failed");
    demoToken = data.demoOtp;
  });

  // 2. Verify OTP & Auto-Link Tickets
  await assert("Verify OTP & Create/Link Customer Profile (/api/customer/verify-otp)", async () => {
    const res = await app.request("/api/customer/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "guest.customer@example.com", code: demoToken }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.profile) throw new Error("OTP verification failed");
  });

  console.log("--------------------------------------------------");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase6Step1Tests().catch((err) => {
  console.error("Phase 6 Step 6.1 Tests Failed:", err);
  process.exit(1);
});
