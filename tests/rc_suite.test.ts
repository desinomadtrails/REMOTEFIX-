import { app } from "../apps/api/src/index.js";
import { signJWT } from "@remotefix/auth";

async function runRcTestSuite() {
  console.log("==================================================");
  console.log("  REMOTEFIX RELEASE CANDIDATE (RC) TEST SUITE");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  // Sign a test JWT token for protected route testing
  const jwtSecret = process.env.JWT_SECRET || "super-secret-key-min-32-chars-remotefix";
  const testToken = await signJWT(
    { sub: "test-user-id", email: "admin@remotefix.com", role: "admin", exp: Math.floor(Date.now() / 1000) + 3600 },
    jwtSecret
  );

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

  // 1. Health Checks & Probes
  await assert("Health check endpoint (/health)", async () => {
    const res = await app.request("/health");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.status !== "healthy") throw new Error("Health status not healthy");
  });

  await assert("Liveness probe (/health/liveness)", async () => {
    const res = await app.request("/health/liveness");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.status !== "alive") throw new Error("Liveness status not alive");
  });

  // 2. Prometheus Metrics
  await assert("Prometheus metrics exporter (/metrics)", async () => {
    const res = await app.request("/metrics");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const text = await res.text();
    if (!text.includes("remotefix_active_organizations")) throw new Error("Missing organization metric");
  });

  // 3. API Documentation
  await assert("OpenAPI 3.1 Specification (/api/docs/openapi.json)", async () => {
    const res = await app.request("/api/docs/openapi.json");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.openapi !== "3.1.0") throw new Error("OpenAPI version mismatch");
  });

  // 4. SAML SSO Metadata
  await assert("SAML 2.0 SP Metadata XML (/api/auth/sso/metadata)", async () => {
    const res = await app.request("/api/auth/sso/metadata");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const xml = await res.text();
    if (!xml.includes("<EntityDescriptor")) throw new Error("Invalid SAML XML payload");
  });

  // 5. Feature Flags Evaluation
  await assert("Public Feature Flags Evaluation (/api/flags/eval)", async () => {
    const res = await app.request("/api/flags/eval");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.success !== true) throw new Error("Flags eval returned unsuccessful");
  });

  // 6. AI Triage Engine (Authenticated)
  await assert("AI Ticket Triage & NLP Classification (/api/ai/triage)", async () => {
    const res = await app.request("/api/ai/triage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${testToken}`,
      },
      body: JSON.stringify({ subject: "Blue screen of death on boot", description: "SYSTEM_SERVICE_EXCEPTION error code 0x0000003B" }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.triage || !data.triage.category) throw new Error("Triage category missing");
  });

  // 7. AI Incident Diagnosis Engine (Authenticated)
  await assert("AI Incident Diagnosis Script (/api/ai/diagnose)", async () => {
    const res = await app.request("/api/ai/diagnose", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${testToken}`,
      },
      body: JSON.stringify({ subject: "Printer spooler stuck", description: "Documents queued but not printing", deviceType: "Windows 11 PC" }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.diagnosis || !data.diagnosis.recommendedSteps) throw new Error("Diagnostic recommendedSteps missing");
  });

  console.log("--------------------------------------------------");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRcTestSuite().catch((err) => {
  console.error("RC Test Suite Execution Failed:", err);
  process.exit(1);
});
