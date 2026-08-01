import { serve } from "@hono/node-server";
import app from "./index.js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config();

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

console.log(`🚀 RemoteFix Node API Server running on http://${hostname}:${port}`);

serve({
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
