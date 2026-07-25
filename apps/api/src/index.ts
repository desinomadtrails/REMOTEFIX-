import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import { securityHeaders } from "./middleware/security.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import { authRouter } from "./routes/auth.js";
import { servicesRouter } from "./routes/services.js";
import { bookingsRouter } from "./routes/bookings.js";
import { ticketsRouter } from "./routes/tickets.js";
import { invoicesRouter } from "./routes/invoices.js";
import { paymentsRouter } from "./routes/payments.js";
import { analyticsRouter } from "./routes/analytics.js";
import { logsRouter } from "./routes/logs.js";
import { getDb } from "./db.js";
import { services } from "@remotefix/database";
import { count } from "drizzle-orm";
import { AppEnv } from "./middleware/auth.js";

const app = new Hono<AppEnv>();

// ==========================================
// MIDDLEWARES
// ==========================================

// 1. Logger
app.use("*", honoLogger());

// 2. CORS configurations
app.use(
  "*",
  cors({
    origin: (origin) => origin || "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
    credentials: true,
  })
);

// 3. Security headers (Helmet-equivalent)
app.use("*", securityHeaders);

// 3.5. Database Connection Warmup
app.use("*", async (c, next) => {
  if (c.req.path.startsWith("/api")) {
    if (c.env && c.env.DATABASE_URL) {
      try {
        const db = getDb(c.env.DATABASE_URL);
        const pool = db.$client;
        if (pool.connecting && !pool.connected) {
          while (pool.connecting && !pool.connected) {
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        } else if (!pool.connected && !pool.connecting) {
          await pool.connect();
        }
      } catch (err) {
        console.error("❌ Failed to warm up database pool:", err);
      }
    }
  }
  await next();
});

// 4. Global Rate Limiter (150 requests per minute)
app.use("*", rateLimiter(150, 60000));

// ==========================================
// ROUTES
// ==========================================

app.route("/api/auth", authRouter);
app.route("/api/services", servicesRouter);
app.route("/api/bookings", bookingsRouter);
app.route("/api/tickets", ticketsRouter);
app.route("/api/invoices", invoicesRouter);
app.route("/api/payments", paymentsRouter);
app.route("/api/admin/analytics", analyticsRouter);
app.route("/api/admin/logs", logsRouter);

app.get("/api/test-db", async (c) => {
  try {
    const db = await getDb(c.env.DATABASE_URL);
    const result = await db.$client.request().query("SELECT 1 as ping");
    return c.json({ success: true, message: "Azure SQL Connection Succeeded!", result: result.recordset });
  } catch (err: any) {
    return c.json({
      success: false,
      error: err.message || err,
      code: err.code,
      stack: err.stack,
    });
  }
});

// ==========================================
// SEEDING & SYSTEM STATUS ENDPOINTS
// ==========================================

app.get("/", (c) => {
  return c.json({
    status: "healthy",
    service: "RemoteFix API Gateway",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.post("/api/seed", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  
  try {
    // Check if services are already seeded
    const sCount = await db.select({ value: count(services.id) }).from(services);
    
    if (sCount[0].value > 0) {
      return c.json({ success: true, message: "Database already seeded with services." });
    }
    
    // Core Services Seed Data
    const coreServices = [
      {
        id: crypto.randomUUID(),
        name: "Remote IT Support",
        description: "Fast diagnostics, troubleshooting, software fixes, and optimizations handled securely via secure remote desktop utilities.",
        category: "Support",
        price: "79.00",
        estimatedDurationMinutes: 60,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        name: "WiFi & Network Configuration",
        description: "Setting up router settings, optimizing channels, configuring guest networks, and fixing dead zones for home and business connections.",
        category: "Networking",
        price: "129.00",
        estimatedDurationMinutes: 90,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        name: "Virus & Malware Removal",
        description: "Full system scan, quarantine of suspicious entities, adware cleanup, registry repairs, and installing enterprise protection suites.",
        category: "Cyber Security",
        price: "99.00",
        estimatedDurationMinutes: 75,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        name: "OS Clean Installation",
        description: "Fresh install of Windows, macOS, or Linux. Complete backup, partition formatting, system install, drivers matching, and OS configurations.",
        category: "Installation",
        price: "149.00",
        estimatedDurationMinutes: 120,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        name: "Data Backup & Recovery",
        description: "Salvaging corrupted documents, recovery from damaged sectors or accidentally formatted files, and setting up automated NAS/Cloud vault backups.",
        category: "Storage",
        price: "199.00",
        estimatedDurationMinutes: 180,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        name: "IT Consultation",
        description: "Structured architecture review, sizing migrations, assessing hardware lifecycles, and drafting cybersecurity risk management strategies.",
        category: "Consulting",
        price: "250.00",
        estimatedDurationMinutes: 60,
        isActive: true,
      },
    ];
    
    await db.insert(services).values(coreServices as any);
    
    return c.json({
      success: true,
      message: "Database services catalog seeded successfully.",
      seededCount: coreServices.length,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// GLOBAL ERROR HANDLERS
// ==========================================

app.notFound((c) => {
  return c.json({ success: false, error: `Route not found: ${c.req.url}` }, 404);
});

app.onError((err, c) => {
  console.error("Unhandle API Error:", err);
  return c.json(
    {
      success: false,
      error: "An unexpected internal server error occurred.",
      details: err.message,
    },
    500
  );
});

export default app;
export { app };
