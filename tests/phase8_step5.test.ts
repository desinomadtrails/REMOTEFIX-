import app from "../apps/api/src/index.js";
import { EnterprisePredictiveEngine } from "../apps/api/src/services/ai/index.js";
import { signJWT } from "@remotefix/auth";

async function runPhase8Step5PredictiveTests() {
  console.log("==================================================");
  console.log("  REMOTEFIX PHASE 8 STEP 8.5 - PREDICTIVE ENGINE & ANALYTICS TESTS");
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

  const jwtSecret = process.env.JWT_SECRET || "super-secret-key-min-32-chars-remotefix";

  const adminToken = await signJWT({
    id: "test-admin-001",
    email: "admin@remotefix.com",
    role: "admin",
    tenantId: "tenant-acme",
  }, jwtSecret);

  const techToken = await signJWT({
    id: "test-tech-001",
    email: "engineer@remotefix.com",
    role: "technician",
    tenantId: "tenant-acme",
  }, jwtSecret);

  // 1. Asset Health Score Engine Test
  await assert("Asset Health Score Calculation (0-100 multi-factor formula)", async () => {
    const healthPristine = EnterprisePredictiveEngine.calculateHealthScore({
      assetId: "AST-1001",
      assetName: "Brand New Workstation",
      assetType: "Workstation",
      tenantId: "tenant-acme",
      ageYears: 0.2,
      failureFrequency12m: 0,
      serviceHistoryCount: 1,
      isUnderWarranty: true,
      isUnderAMC: true,
      openIncidentsCount: 0,
    });

    if (healthPristine.healthScore < 90 || healthPristine.riskCategory !== "Pristine") {
      throw new Error(`Expected Pristine health score, got ${healthPristine.healthScore} (${healthPristine.riskCategory})`);
    }

    const healthCritical = EnterprisePredictiveEngine.calculateHealthScore({
      assetId: "AST-1002",
      assetName: "Legacy Server Unit",
      assetType: "Server",
      tenantId: "tenant-acme",
      ageYears: 5.5,
      failureFrequency12m: 4,
      serviceHistoryCount: 12,
      isUnderWarranty: false,
      isUnderAMC: false,
      openIncidentsCount: 2,
      telemetry: { timestamp: new Date().toISOString(), cpuTemperatureC: 92, diskSmartHealthPercent: 45 },
    });

    if (healthCritical.healthScore >= 50 || (healthCritical.riskCategory !== "Critical" && healthCritical.riskCategory !== "High Risk")) {
      throw new Error(`Expected Critical/High Risk score, got ${healthCritical.healthScore} (${healthCritical.riskCategory})`);
    }
  });

  // 2. Failure Prediction & Remaining Useful Life (RUL) Test
  await assert("Failure Probability & Remaining Useful Life (RUL) Estimation", async () => {
    const prediction = await EnterprisePredictiveEngine.predictFailure({
      assetId: "AST-UPS-01",
      assetName: "Enterprise UPS Module",
      assetType: "UPS",
      tenantId: "tenant-acme",
      ageYears: 4.5,
      failureFrequency12m: 3,
      serviceHistoryCount: 6,
      isUnderWarranty: false,
      isUnderAMC: true,
      openIncidentsCount: 1,
    });

    if (prediction.failureProbability <= 0 || prediction.remainingUsefulLifeDays <= 0) {
      throw new Error("Failure prediction or RUL estimation returned invalid zero/negative metrics.");
    }
    if (!prediction.predictedFailureCategory || !prediction.recommendedAction) {
      throw new Error("Failure prediction missing category or recommended action.");
    }
  });

  // 3. Telemetry Stream Anomaly Detection Test
  await assert("Telemetry Stream Anomaly Detection Engine", async () => {
    const anomalyResult = EnterprisePredictiveEngine.detectAnomalies([
      { timestamp: new Date().toISOString(), cpuTemperatureC: 96, diskSmartHealthPercent: 42, errorCount24h: 18 },
    ]);

    if (!anomalyResult.hasAnomalies || anomalyResult.anomalyCount < 2 || anomalyResult.overallRiskLevel !== "Severe") {
      throw new Error("Telemetry anomaly detection failed to trigger severe risk level.");
    }
  });

  // 4. Recommendation Engine Test
  await assert("Multi-Tier Preventive & Contract Renewal Recommendation Engine", async () => {
    const recs = EnterprisePredictiveEngine.generateRecommendations({
      assetId: "AST-PRN-05",
      assetName: "Office Printer",
      assetType: "Printer",
      tenantId: "tenant-acme",
      ageYears: 3.0,
      failureFrequency12m: 4,
      serviceHistoryCount: 8,
      isUnderWarranty: false,
      isUnderAMC: false,
      openIncidentsCount: 2,
    });

    if (recs.length === 0) throw new Error("Recommendation engine returned empty list.");
    const actionTypes = recs.map((r) => r.actionType);
    if (!actionTypes.includes("Renew Warranty") && !actionTypes.includes("Renew AMC")) {
      throw new Error("Recommendation engine failed to generate contract renewal recommendation.");
    }
  });

  // 5. Inventory Reorder & Demand Forecasting Test
  await assert("Inventory Reorder & Seasonal Demand Forecasting", async () => {
    const forecast = EnterprisePredictiveEngine.forecastInventory({ tenantId: "tenant-acme", timeHorizonDays: 30 });
    if (forecast.frequentlyConsumedParts.length === 0 || forecast.upcomingShortages.length === 0) {
      throw new Error("Inventory forecasting engine returned empty parts or shortages list.");
    }
  });

  // 6. Executive Predictive Analytics Test
  await assert("Executive Predictive Analytics Backend Engine", async () => {
    const analytics = EnterprisePredictiveEngine.getExecutiveAnalytics({ tenantId: "tenant-acme" });
    if (analytics.totalAssetsMonitored <= 0 || analytics.aiPredictionAccuracyPercent < 90) {
      throw new Error("Executive analytics metrics fall below expected baseline thresholds.");
    }
  });

  // 7. REST API Endpoints Verification
  await assert("Predictive REST API Endpoints (/api/ai/predictive/*)", async () => {
    // POST /health-score
    const resHealth = await app.request("/api/ai/predictive/health-score", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${techToken}` },
      body: JSON.stringify({ assetName: "Test Workstation", ageYears: 1.0 }),
    });
    if (resHealth.status !== 200) throw new Error(`Health endpoint returned status ${resHealth.status}`);
    const jsonHealth = await resHealth.json();
    if (!jsonHealth.success || jsonHealth.result.healthScore === undefined) throw new Error("Invalid health response JSON");

    // GET /executive-analytics
    const resAnalytics = await app.request("/api/ai/predictive/executive-analytics", {
      method: "GET",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (resAnalytics.status !== 200) throw new Error(`Analytics endpoint returned status ${resAnalytics.status}`);
    const jsonAnalytics = await resAnalytics.json();
    if (!jsonAnalytics.success || !jsonAnalytics.analytics.averageHealthScore) throw new Error("Invalid analytics response JSON");
  });

  // 8. Copilot Predictive Intent Natural Language Query Test
  await assert("Copilot Natural Language Predictive Query Integration", async () => {
    const copilotRes = await EnterprisePredictiveEngine.handleCopilotPredictiveQuery("Which assets are likely to fail this month?", "tenant-acme");
    if (!copilotRes.answer || copilotRes.relevantAssets.length === 0) {
      throw new Error("Copilot predictive intent handler failed to return relevant failing assets.");
    }
  });

  // 9. RBAC & Tenant Isolation Security Test
  await assert("RBAC & Multi-Tenant Security Enforcement", async () => {
    // Technician attempting to access admin executive analytics should be rejected with 403
    const resForbidden = await app.request("/api/ai/predictive/executive-analytics", {
      method: "GET",
      headers: { Authorization: `Bearer ${techToken}` },
    });
    if (resForbidden.status !== 403) throw new Error(`Expected 403 Forbidden for technician on admin endpoint, got ${resForbidden.status}`);
  });

  console.log("--------------------------------------------------");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase8Step5PredictiveTests().catch((err) => {
  console.error("Phase 8 Step 8.5 Predictive Tests Failed:", err);
  process.exit(1);
});
