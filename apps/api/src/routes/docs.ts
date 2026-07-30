import { Hono } from "hono";
import { AppEnv } from "../middleware/auth.js";

const docsRouter = new Hono<AppEnv>();

const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "RemoteFix Enterprise Multi-Tenant Platform API",
    version: "2.4.0",
    description: "Enterprise SaaS API for IT Service Management (ITSM), Cross-Platform RMM, AI Incident Triage, ITAM Asset Tracking, AMC Billing, SAML SSO, and Governance.",
    contact: { name: "RemoteFix Enterprise Developer Relations", email: "api-support@remotefix.com", url: "https://remotefix.com" },
  },
  servers: [{ url: "https://remotefix.com", description: "Production Edge Cloud API" }, { url: "http://localhost:8787", description: "Local Development Server" }],
  components: {
    securitySchemes: {
      BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT", description: "Provide JWT token obtained via /api/auth/login or /api/auth/sso/callback" },
    },
  },
  security: [{ BearerAuth: [] }],
  paths: {
    "/api/auth/login": {
      post: {
        summary: "User Authentication & JWT Issuance",
        tags: ["Authentication"],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" } }, required: ["email", "password"] } } } },
        responses: { 200: { description: "Returns JWT Token and User Profile" } },
      },
    },
    "/api/auth/sso/metadata": {
      get: {
        summary: "SAML 2.0 Service Provider Metadata XML",
        tags: ["Authentication & SSO"],
        responses: { 200: { description: "XML SAML 2.0 Metadata for Okta / Azure AD configuration" } },
      },
    },
    "/api/bookings": {
      get: { summary: "List Service Bookings & Tickets", tags: ["Bookings & Tickets"], responses: { 200: { description: "Array of customer service bookings" } } },
      post: { summary: "Create Guest or Member Repair Booking", tags: ["Bookings & Tickets"], responses: { 201: { description: "Created repair booking with tracking token" } } },
    },
    "/api/ai/triage": {
      post: { summary: "AI Incident Triage & NLP Ticket Classification", tags: ["AI Intelligence Engine"], responses: { 200: { description: "AI category, urgency, and estimated fix duration" } } },
    },
    "/api/ai/diagnose": {
      post: { summary: "AI Root Cause Diagnosis & Repair Instructions", tags: ["AI Intelligence Engine"], responses: { 200: { description: "Diagnostic analysis and step-by-step resolution script" } } },
    },
    "/api/rmm/agent/telemetry": {
      post: { summary: "RMM Agent Telemetry Ingestion Endpoint", tags: ["RMM Endpoints"], responses: { 200: { description: "Telemetry metric recorded successfully" } } },
    },
    "/api/admin/logs": {
      get: { summary: "Fetch Immutable Security Audit Logs", tags: ["Governance & Audit"], responses: { 200: { description: "List of platform audit log entries" } } },
    },
    "/api/admin/logs/export-csv": {
      get: { summary: "Stream Audit Logs as CSV File", tags: ["Governance & Audit"], responses: { 200: { description: "RFC 4180 CSV export of system audit trail" } } },
    },
  },
};

// ==========================================
// 1. OPENAPI JSON ENDPOINT
// ==========================================
docsRouter.get("/openapi.json", (c) => c.json(openApiSpec));

// ==========================================
// 2. SWAGGER UI INTERACTIVE DOCUMENTATION
// ==========================================
docsRouter.get("/", (c) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RemoteFix Enterprise API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body { margin: 0; background: #0b0f19; color: #fff; font-family: sans-serif; }
    .swagger-ui .topbar { display: none; }
    .swagger-ui { filter: invert(88%) hue-rotate(180deg); }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api/docs/openapi.json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis],
    });
  </script>
</body>
</html>`;

  return c.html(html);
});

export { docsRouter };
