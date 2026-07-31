import { app } from "../apps/api/src/index.js";

async function runPhase7Step4Tests() {
  console.log("==================================================");
  console.log("  REMOTEFIX PHASE 7 STEP 7.4 - SECURITY & RELEASE TESTS");
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

  // 1. Device Security Attestation & Root Detection Check
  await assert("Mobile Device Security Attestation (/api/mobile/security/attest)", async () => {
    const res = await app.request("/api/mobile/security/attest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceToken: "token-attest-101", platform: "android", isRooted: false, isJailbroken: false, appIntegrityHash: "sha256:abcd1234efgh5678" }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.securityCheckPassed) throw new Error("Security attestation check failed");
  });

  // 2. Latest OTA Mobile Release Bundle
  await assert("Fetch Latest Mobile Release Bundle (/api/mobile/release/latest)", async () => {
    const res = await app.request("/api/mobile/release/latest?platform=android");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.buildVersion || !data.bundleUrl) throw new Error("Latest release bundle fetch failed");
  });

  // 3. App Store & Play Store Release Manifest
  await assert("Verify App Store & Play Store Manifest (/api/mobile/release/manifest)", async () => {
    const res = await app.request("/api/mobile/release/manifest");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.playStore || !data.appStore) throw new Error("Release manifest verification failed");
  });

  console.log("--------------------------------------------------");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase7Step4Tests().catch((err) => {
  console.error("Phase 7 Step 7.4 Tests Failed:", err);
  process.exit(1);
});
