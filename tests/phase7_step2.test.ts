import { app } from "../apps/api/src/index.js";

async function runPhase7Step2Tests() {
  console.log("==================================================");
  console.log("  REMOTEFIX PHASE 7 STEP 7.2 - CUSTOMER MOBILE & PUSH TESTS");
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

  // 1. Register Customer Mobile FCM Device Token
  await assert("Register Customer Mobile FCM Token (/api/customer/mobile/register-device)", async () => {
    const res = await app.request("/api/customer/mobile/register-device", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "customer@remotefix.com", deviceToken: "fcm-customer-device-token-8899" }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.deviceId) throw new Error("Customer device registration failed");
  });

  // 2. Dispatch FCM Push Notification
  await assert("Dispatch FCM Real-Time Push Notification (/api/customer/mobile/push/send)", async () => {
    const res = await app.request("/api/customer/mobile/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientType: "customer", recipientId: "cust-101", title: "Technician En Route", body: "Senior Engineer is travelling to your location." }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.notificationId) throw new Error("Push dispatch failed");
  });

  // 3. Fetch Push Notifications Inbox
  await assert("Fetch Push Notifications Inbox (/api/customer/mobile/notifications)", async () => {
    const res = await app.request("/api/customer/mobile/notifications?email=customer@remotefix.com");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.notifications)) throw new Error("Notifications inbox fetch failed");
  });

  // 4. Live GPS Technician Telemetry Tracking
  await assert("Fetch Live GPS Technician Tracking (/api/customer/mobile/tracking/RF-MOB-00101)", async () => {
    const res = await app.request("/api/customer/mobile/tracking/RF-MOB-00101");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.engineer || !data.engineer.etaMinutes) throw new Error("Live GPS tracking failed");
  });

  console.log("--------------------------------------------------");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase7Step2Tests().catch((err) => {
  console.error("Phase 7 Step 7.2 Tests Failed:", err);
  process.exit(1);
});
