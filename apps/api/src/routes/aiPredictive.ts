import { Hono } from "hono";
import { requireAuth, requireRole, AppEnv } from "../middleware/auth.js";
import { EnterprisePredictiveEngine, AssetHealthFactors, AssetTelemetry } from "../services/ai/index.js";

const aiPredictiveRouter = new Hono<AppEnv>();

// Require authentication for all predictive endpoints
aiPredictiveRouter.use("*", requireAuth);

/**
 * 1. Calculate Asset Health Score (0 - 100)
 */
aiPredictiveRouter.post("/health-score", async (c) => {
  try {
    const payload = await c.req.json();
    const userTenant = c.get("user")?.tenantId || payload.tenantId || "tenant-default";

    const factors: AssetHealthFactors = {
      assetId: payload.assetId || `AST-${crypto.randomUUID().substring(0, 6)}`,
      assetName: payload.assetName || "Enterprise Workstation",
      assetType: payload.assetType || "Workstation",
      tenantId: userTenant,
      ageYears: payload.ageYears ?? 2.5,
      failureFrequency12m: payload.failureFrequency12m ?? 1,
      serviceHistoryCount: payload.serviceHistoryCount ?? 3,
      isUnderWarranty: payload.isUnderWarranty ?? true,
      isUnderAMC: payload.isUnderAMC ?? true,
      openIncidentsCount: payload.openIncidentsCount ?? 0,
      telemetry: payload.telemetry,
      previousPredictionsCount: payload.previousPredictionsCount ?? 5,
    };

    const healthResult = EnterprisePredictiveEngine.calculateHealthScore(factors);

    return c.json({
      success: true,
      tenantId: userTenant,
      result: healthResult,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to calculate asset health score." }, 500);
  }
});

/**
 * 2. Failure Prediction & Remaining Useful Life (RUL)
 */
aiPredictiveRouter.post("/failure-prediction", async (c) => {
  try {
    const payload = await c.req.json();
    const userTenant = c.get("user")?.tenantId || payload.tenantId || "tenant-default";

    const factors: AssetHealthFactors = {
      assetId: payload.assetId || `AST-${crypto.randomUUID().substring(0, 6)}`,
      assetName: payload.assetName || "Datacenter Core Switch",
      assetType: payload.assetType || "Switch",
      tenantId: userTenant,
      ageYears: payload.ageYears ?? 3.8,
      failureFrequency12m: payload.failureFrequency12m ?? 3,
      serviceHistoryCount: payload.serviceHistoryCount ?? 6,
      isUnderWarranty: payload.isUnderWarranty ?? false,
      isUnderAMC: payload.isUnderAMC ?? true,
      openIncidentsCount: payload.openIncidentsCount ?? 1,
      telemetry: payload.telemetry,
    };

    const prediction = await EnterprisePredictiveEngine.predictFailure(factors);

    return c.json({
      success: true,
      tenantId: userTenant,
      prediction,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to predict asset failure." }, 500);
  }
});

/**
 * 3. Telemetry Stream Anomaly Detection
 */
aiPredictiveRouter.post("/anomalies", async (c) => {
  try {
    const payload = await c.req.json();
    const telemetryData: AssetTelemetry[] = payload.telemetry || [
      {
        timestamp: new Date().toISOString(),
        cpuTemperatureC: payload.cpuTemperatureC || 88,
        diskSmartHealthPercent: payload.diskSmartHealthPercent || 58,
        errorCount24h: payload.errorCount24h || 16,
      },
    ];

    const result = EnterprisePredictiveEngine.detectAnomalies(telemetryData);

    return c.json({
      success: true,
      result,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to run telemetry anomaly detection." }, 500);
  }
});

/**
 * 4. Generate Preventive & Maintenance Recommendations
 */
aiPredictiveRouter.post("/recommendations", async (c) => {
  try {
    const payload = await c.req.json();
    const userTenant = c.get("user")?.tenantId || payload.tenantId || "tenant-default";

    const factors: AssetHealthFactors = {
      assetId: payload.assetId || "AST-0099",
      assetName: payload.assetName || "Main Office UPS Module",
      assetType: payload.assetType || "UPS",
      tenantId: userTenant,
      ageYears: payload.ageYears ?? 5.2,
      failureFrequency12m: payload.failureFrequency12m ?? 4,
      serviceHistoryCount: payload.serviceHistoryCount ?? 10,
      isUnderWarranty: payload.isUnderWarranty ?? false,
      isUnderAMC: payload.isUnderAMC ?? false,
      openIncidentsCount: payload.openIncidentsCount ?? 2,
      telemetry: payload.telemetry || { timestamp: new Date().toISOString(), cpuTemperatureC: 92 },
    };

    const recommendations = EnterprisePredictiveEngine.generateRecommendations(factors);

    return c.json({
      success: true,
      tenantId: userTenant,
      count: recommendations.length,
      recommendations,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to generate recommendations." }, 500);
  }
});

/**
 * 5. Inventory Reorder & Demand Forecasting
 */
aiPredictiveRouter.post("/inventory-forecast", requireRole(["admin", "manager", "dispatcher"]), async (c) => {
  try {
    const payload = await c.req.json().catch(() => ({}));
    const userTenant = c.get("user")?.tenantId || payload.tenantId || "tenant-default";
    const timeHorizonDays = payload.timeHorizonDays || 30;

    const forecast = EnterprisePredictiveEngine.forecastInventory({ tenantId: userTenant, timeHorizonDays });

    return c.json({
      success: true,
      tenantId: userTenant,
      forecast,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to generate inventory forecast." }, 500);
  }
});

/**
 * 6. Executive Predictive Analytics Backend Metrics
 */
aiPredictiveRouter.get("/executive-analytics", requireRole(["admin", "manager"]), async (c) => {
  try {
    const userTenant = c.get("user")?.tenantId || c.req.query("tenantId") || "tenant-default";

    const analytics = EnterprisePredictiveEngine.getExecutiveAnalytics({ tenantId: userTenant });

    return c.json({
      success: true,
      tenantId: userTenant,
      analytics,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to retrieve executive analytics." }, 500);
  }
});

/**
 * 7. Copilot Integration Endpoint for Predictive NL Queries
 */
aiPredictiveRouter.post("/copilot-query", async (c) => {
  try {
    const { prompt, message } = await c.req.json();
    const queryStr = prompt || message;
    if (!queryStr) {
      return c.json({ success: false, error: "Prompt or message parameter is required." }, 400);
    }

    const userTenant = c.get("user")?.tenantId || "tenant-default";
    const response = await EnterprisePredictiveEngine.handleCopilotPredictiveQuery(queryStr, userTenant);

    return c.json({
      success: true,
      tenantId: userTenant,
      reply: response.answer,
      relevantAssets: response.relevantAssets,
      recommendations: response.recommendations,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to execute copilot predictive query." }, 500);
  }
});

export { aiPredictiveRouter };
