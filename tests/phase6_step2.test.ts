import { app } from "../apps/api/src/index.js";
import { signJWT } from "@remotefix/auth";

async function runPhase6Step2Tests() {
  console.log("==================================================");
  console.log("  REMOTEFIX PHASE 6 STEP 6.2 - CUSTOMER DASHBOARD TESTS");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  const jwtSecret = process.env.JWT_SECRET || "super-secret-key-min-32-chars-remotefix";
  const token = await signJWT({ sub: "admin-123", email: "admin@remotefix.com", role: "admin", exp: Math.floor(Date.now() / 1000) + 3600 }, jwtSecret);

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

  // 1. Convert Guest Customer
  await assert("Admin Convert Guest to Registered Profile (/api/customer/admin/convert-guest)", async () => {
    const res = await app.request("/api/customer/admin/convert-guest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ email: "guest.customer@example.com", customerName: "John Doe", companyName: "Acme Corp" }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.profile) throw new Error("Convert guest customer failed");
  });

  // 2. Merge Customer Profiles
  await assert("Admin Merge Duplicate Customers (/api/customer/admin/merge)", async () => {
    const res = await app.request("/api/customer/admin/merge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ primaryEmail: "primary@example.com", secondaryEmail: "secondary@example.com" }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error("Merge duplicate customers failed");
  });

  console.log("--------------------------------------------------");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase6Step2Tests().catch((err) => {
  console.error("Phase 6 Step 6.2 Tests Failed:", err);
  process.exit(1);
});
