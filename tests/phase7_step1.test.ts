import { app } from "../apps/api/src/index.js";
import { signJWT } from "@remotefix/auth";

async function runPhase7Step1Tests() {
  console.log("==================================================");
  console.log("  REMOTEFIX PHASE 7 STEP 7.1 - TECHNICIAN MOBILE APP TESTS");
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

  // 1. Mobile Biometric Login
  await assert("Mobile Biometric Login (/api/mobile/auth/biometric-login)", async () => {
    const res = await app.request("/api/mobile/auth/biometric-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ engineerEmail: "field.tech@remotefix.com" }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.token) throw new Error("Biometric authentication failed");
  });

  // 2. Register Device Push Token
  await assert("Register Mobile Device Token (/api/mobile/devices/register)", async () => {
    const res = await app.request("/api/mobile/devices/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ deviceToken: "fcm-token-android-12345", platform: "android", appVersion: "1.0.0" }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error("Device registration failed");
  });

  // 3. Fetch Assigned Jobs
  await assert("Fetch Today's Assigned Jobs (/api/mobile/jobs)", async () => {
    const res = await app.request("/api/mobile/jobs", {
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.jobs)) throw new Error("Fetch assigned jobs failed");
  });

  // 4. Job State Machine Action (Start Travel)
  await assert("Execute Job Action State Machine (/api/mobile/jobs/job-101/action)", async () => {
    const res = await app.request("/api/mobile/jobs/job-101/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "start_travel", gpsLocation: { lat: 28.4595, lng: 77.0266 } }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || data.newStatus !== "start_travel") throw new Error("Job state machine failed");
  });

  // 5. Digital Signature Capture
  await assert("Customer Digital Signature Capture (/api/mobile/jobs/job-101/signature)", async () => {
    const res = await app.request("/api/mobile/jobs/job-101/signature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ signatureBase64: "BASE64_SIG_DATA", customerName: "John Doe" }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.completionCertificateUrl) throw new Error("Signature capture failed");
  });

  // 6. QR Code Asset Lookup
  await assert("Instant QR Code / Barcode Scan (/api/mobile/qr-scan)", async () => {
    const res = await app.request("/api/mobile/qr-scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ qrPayload: "RF-AST-00101" }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.asset) throw new Error("QR scan lookup failed");
  });

  // 7. Background Offline Sync Queue Processor
  await assert("Background Offline Sync Engine (/api/mobile/sync)", async () => {
    const res = await app.request("/api/mobile/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ queueItems: [{ id: "off-1", actionType: "status_update", payloadJson: "{}" }] }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || data.syncedItemsCount !== 1) throw new Error("Offline sync processor failed");
  });

  console.log("--------------------------------------------------");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase7Step1Tests().catch((err) => {
  console.error("Phase 7 Step 7.1 Tests Failed:", err);
  process.exit(1);
});
