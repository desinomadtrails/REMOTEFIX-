import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../db.js";
import { ssoProviders, users } from "@remotefix/database";
import { signJWT } from "@remotefix/auth";
import { requireAuth, requireRole, AppEnv } from "../middleware/auth.js";

const ssoRouter = new Hono<AppEnv>();

// ==========================================
// 1. PUBLIC SAML SP METADATA & LOGIN DISPATCH
// ==========================================
ssoRouter.get("/sso/metadata", (c) => {
  const spMetadataXml = `<?xml version="1.0"?>
<EntityDescriptor entityID="https://remotefix.com/api/auth/sso/metadata" xmlns="urn:oasis:names:tc:SAML:2.0:metadata">
  <SPSSODescriptor AuthnRequestsSigned="false" WantAssertionsSigned="true" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://remotefix.com/api/auth/sso/callback" index="1"/>
  </SPSSODescriptor>
</EntityDescriptor>`;

  return c.text(spMetadataXml, 200, { "Content-Type": "application/xml" });
});

ssoRouter.post("/sso/login", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const { domain, email } = await c.req.json();
    const userDomain = domain || (email ? email.split("@")[1] : null);

    if (!userDomain) {
      return c.json({ success: false, error: "Domain or email address required for SSO dispatch." }, 400);
    }

    const providers = await db.select().from(ssoProviders).where(eq(ssoProviders.domain, userDomain));

    if (providers.length === 0 || !providers[0].isEnabled) {
      return c.json({ success: false, error: `No active SSO configuration found for domain @${userDomain}` }, 404);
    }

    const sso = providers[0];
    const samlRedirectUrl = `${sso.ssoUrl}?SAMLRequest=${encodeURIComponent(btoa(`RelayState=${sso.id}`))}`;

    return c.json({
      success: true,
      providerType: sso.providerType,
      redirectUrl: samlRedirectUrl,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "SSO dispatch failed" }, 500);
  }
});

ssoRouter.post("/sso/callback", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const { samlResponse, email, fullName } = await c.req.json();
    if (!email) {
      return c.json({ success: false, error: "Email assertion required in SAML payload." }, 400);
    }

    // Check existing user identity or auto-provision SSO user
    let existingUsers = await db.select().from(users).where(eq(users.email, email));

    let user: any;
    if (existingUsers.length > 0) {
      user = existingUsers[0];
    } else {
      const userId = crypto.randomUUID();
      await db.insert(users).values({
        id: userId,
        email,
        fullName: fullName || email.split("@")[0],
        role: "admin",
        status: "active",
        emailVerified: true,
      });
      const created = await db.select().from(users).where(eq(users.id, userId));
      user = created[0];
    }

    // Sign JWT Token
    const jwtSecret = c.env.JWT_SECRET || "super-secret-key-min-32-chars-remotefix";
    const token = await signJWT(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        exp: Math.floor(Date.now() / 1000) + 86400 * 7,
      },
      jwtSecret
    );

    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "SSO authentication assertion failed" }, 500);
  }
});

// ==========================================
// 2. ADMIN SSO CONFIGURATION APIS
// ==========================================
ssoRouter.get("/admin/sso", requireAuth, requireRole(["admin", "super_admin", "org_admin"]), async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const providers = await db.select().from(ssoProviders);
    return c.json({ success: true, providers });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to fetch SSO providers" }, 500);
  }
});

ssoRouter.post("/admin/sso", requireAuth, requireRole(["admin", "super_admin", "org_admin"]), async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  try {
    const { providerType, issuerUrl, ssoUrl, certificatePem, domain } = await c.req.json();

    if (!providerType || !issuerUrl || !ssoUrl) {
      return c.json({ success: false, error: "Provider type, Issuer URL, and SSO URL are required." }, 400);
    }

    const providerId = crypto.randomUUID();
    await db.insert(ssoProviders).values({
      id: providerId,
      providerType,
      issuerUrl,
      ssoUrl,
      certificatePem: certificatePem || null,
      domain: domain || null,
      isEnabled: true,
    });

    const created = await db.select().from(ssoProviders).where(eq(ssoProviders.id, providerId));
    return c.json({ success: true, provider: created[0] }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "Failed to configure SSO provider" }, 500);
  }
});

export { ssoRouter };
