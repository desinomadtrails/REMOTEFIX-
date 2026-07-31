import { app } from "../apps/api/src/index.js";
import { signJWT } from "@remotefix/auth";

async function runPhase7Step3Tests() {
  console.log("==================================================");
  console.log("  REMOTEFIX PHASE 7 STEP 7.3 - OFFLINE SYNC & NATIVE TESTS");
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

  // 1. Conflict Resolution Engine
  await assert("Execute Conflict Resolution Engine (/api/mobile/offline/conflict-resolution)", async () => {
    const res = await app.request("/api/mobile/offline/conflict-resolution", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        queueItemId: "off-item-99",
        clientTimestamp: new Date().toISOString(),
        clientPayload: { status: "completed", note: "Client edit" },
        serverPayload: { status: "in_progress", note: "Server edit" },
      }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.conflictId || !data.strategy) throw new Error("Conflict resolution failed");
  });

  // 2. Fetch Offline Mobile Inventory
  await assert("Fetch Offline Technician Inventory (/api/mobile/offline/inventory)", async () => {
    const res = await app.request("/api/mobile/offline/inventory", {
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.inventory)) throw new Error("Offline inventory fetch failed");
  });

  // 3. Offline Inventory Parts Reservation
  await assert("Reserve Parts Offline (/api/mobile/offline/inventory/reserve)", async () => {
    const res = await app.request("/api/mobile/offline/inventory/reserve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ partNumber: "PT-RAM-16GB-DDR5", quantity: 1 }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || data.quantityReserved !== 1) throw new Error("Offline inventory reservation failed");
  });

  // 4. Native Mobile Photo Compression
  await assert("Compress Native Equipment Photo (/api/mobile/offline/compress-photo)", async () => {
    const res = await app.request("/api/mobile/offline/compress-photo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ originalSizeKb: 5000, width: 3840, height: 2160 }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.compressedSizeKb || data.compressedSizeKb >= 5000) throw new Error("Photo compression failed");
  });

  console.log("--------------------------------------------------");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase7Step3Tests().catch((err) => {
  console.error("Phase 7 Step 7.3 Tests Failed:", err);
  process.exit(1);
});
