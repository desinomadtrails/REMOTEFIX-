import { app } from "../apps/api/src/index.js";
import { signJWT } from "@remotefix/auth";

async function runPhase8Step4Tests() {
  console.log("==================================================");
  console.log("  REMOTEFIX PHASE 8 STEP 8.4 - ENTERPRISE RAG TESTS");
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

  // 1. RAG Knowledge Search
  await assert("RAG Knowledge Search Endpoint (/api/ai/rag/search)", async () => {
    const res = await app.request("/api/ai/rag/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ query: "BSOD Memory SODIMM RAM test" }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || data.docCount === 0 || !Array.isArray(data.documents)) {
      throw new Error("RAG Search failed");
    }
  });

  // 2. Contextual RAG Chat Generation
  await assert("Contextual RAG Chat Generation (/api/ai/rag/chat)", async () => {
    const res = await app.request("/api/ai/rag/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ query: "How to fix Wi-Fi DHCP IP conflict?" }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.reply || !Array.isArray(data.retrievedDocuments)) {
      throw new Error("RAG Chat generation failed");
    }
  });

  console.log("--------------------------------------------------");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase8Step4Tests().catch((err) => {
  console.error("Phase 8 Step 8.4 Tests Failed:", err);
  process.exit(1);
});
