import dotenv from "dotenv";
import path from "path";

// Load environment variables before module dependencies
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config();

import { serve } from "@hono/node-server";
import app from "./index.js";
import { initializeDb, closeDb } from "./db.js";

const port = Number(process.env.PORT) || 8787;
const hostname = process.env.HOST || "0.0.0.0";

const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

let databaseUrl = process.env.DATABASE_URL || "";

if (!databaseUrl && dbHost && dbName && dbUser && dbPassword) {
  databaseUrl = `Server=${dbHost},${dbPort || "1433"};Database=${dbName};User Id=${dbUser};Password=${dbPassword};Encrypt=true;TrustServerCertificate=true;`;
}

async function startServer() {
  console.log(`====================================================`);
  console.log(`🚀 Starting RemoteFix Enterprise API Server`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📍 Host: ${hostname}:${port}`);
  console.log(`====================================================`);

  try {
    await initializeDb(databaseUrl);
    console.log(`✅ Database pool successfully pre-connected.`);
  } catch (err: any) {
    console.error(`⚠️ Initial database connection attempt failed:`, err.message || err);
    console.error(`⚠️ Server starting in degraded mode. Re-connection will be attempted on requests.`);
  }

  const server = serve({
    fetch: (req) => {
      const env = {
        DATABASE_URL: databaseUrl,
        JWT_SECRET: process.env.JWT_SECRET || "",
        AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING || "",
        AZURE_STORAGE_CONTAINER: "booking-images",
      };
      return app.fetch(req, env);
    },
    hostname,
    port,
  });

  console.log(`🚀 RemoteFix Node API Server listening on http://${hostname}:${port}`);

  const gracefulShutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    try {
      await closeDb();
      server.close();
      console.log(`👋 Server and database connections closed successfully.`);
      process.exit(0);
    } catch (err) {
      console.error(`❌ Error during graceful shutdown:`, err);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
}

startServer().catch((err) => {
  console.error("❌ Fatal API Server startup error:", err);
  process.exit(1);
});

