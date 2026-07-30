import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../db.js";
import { featureFlags } from "@remotefix/database";
import { requireAuth, requireRole, AppEnv } from "../middleware/auth.js";

const flagsRouter = new Hono<AppEnv>();

// Default system feature flags seeding
const DEFAULT_FLAGS = [
  { key: "ai_triage_enabled", name: "AI Incident Triage & Root Cause", description: "Enables NLP ticket classification and resolution scripts", isEnabled: true },
  { key: "rmm_terminal_enabled", name: "Cross-Platform RMM Shell", description: "Enables remote terminal shell execution on managed endpoints", isEnabled: true },
  { key: "saml_sso_enabled", name: "Enterprise SAML / Okta SSO", description: "Enables corporate single sign-on authentication", isEnabled: true },
  { key: "amc_reports_enabled", name: "AMC Contract GST Billing Reports", description: "Enables annual maintenance contract PDF and report generation", isEnabled: true },
  { key: "beta_ai_predictive", name: "AI Hardware Risk Scan (Beta)", description: "Beta hardware failure risk prediction algorithm", isEnabled: false },
];

// ==========================================
// 1. PUBLIC FEATURE FLAGS EVALUATION ENDPOINT
// ==========================================
flagsRouter.get("/eval", async (c) => {
  const dbUrl = c.env?.DATABASE_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    // Default fallback when DB URL is not set in isolated unit test environment
    const defaultFlagMap = {
      ai_triage_enabled: true,
      rmm_terminal_enabled: true,
      saml_sso_enabled: true,
      amc_reports_enabled: true,
      beta_ai_predictive: false,
    };
    return c.json({ success: true, flags: defaultFlagMap });
  }

  const db = getDb(dbUrl);

  try {
    let flags = await db.select().from(featureFlags);

    if (flags.length === 0) {
      for (const df of DEFAULT_FLAGS) {
        await db.insert(featureFlags).values({
          id: crypto.randomUUID(),
          ...df,
          rolloutPercentage: 100,
        });
      }
      flags = await db.select().from(featureFlags);
    }

    const flagMap: Record<string, boolean> = {};
    for (const f of flags) {
      flagMap[f.key] = Boolean(f.isEnabled);
    }

    return c.json({ success: true, flags: flagMap });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 2. ADMIN FEATURE FLAGS MANAGEMENT
// ==========================================
flagsRouter.get("/admin", requireAuth, requireRole(["admin", "super_admin", "org_admin"]), async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    let list = await db.select().from(featureFlags);
    if (list.length === 0) {
      for (const df of DEFAULT_FLAGS) {
        await db.insert(featureFlags).values({
          id: crypto.randomUUID(),
          ...df,
          rolloutPercentage: 100,
        });
      }
      list = await db.select().from(featureFlags);
    }

    return c.json({ success: true, flags: list });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

flagsRouter.patch("/admin/:id/toggle", requireAuth, requireRole(["admin", "super_admin"]), async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const flagId = c.req.param("id");

  try {
    const existing = await db.select().from(featureFlags).where(eq(featureFlags.id, flagId));
    if (existing.length === 0) {
      return c.json({ success: false, error: "Feature flag not found" }, 404);
    }

    const newStatus = !existing[0].isEnabled;
    await db.update(featureFlags).set({ isEnabled: newStatus as any }).where(eq(featureFlags.id, flagId));

    return c.json({ success: true, isEnabled: newStatus });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export { flagsRouter };
