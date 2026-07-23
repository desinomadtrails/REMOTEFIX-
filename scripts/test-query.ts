import { createDb } from "../packages/database/database/client.ts";
import { services } from "../packages/database/database/schema/index.ts";
import dotenv from "dotenv";

dotenv.config();

const { DB_HOST, DB_PORT = "1433", DB_NAME, DB_USER, DB_PASSWORD } = process.env;
const databaseUrl = `Server=${DB_HOST},${DB_PORT};Database=${DB_NAME};User Id=${DB_USER};Password=${DB_PASSWORD};Encrypt=true;TrustServerCertificate=false;`;

async function test() {
  console.log("🔌 Connecting using createDb...");
  console.log(`📍 URL: ${databaseUrl.replace(DB_PASSWORD || "", "********")}`);
  const db = createDb(databaseUrl);
  
  console.log("⏳ Waiting 3 seconds...");
  await new Promise(r => setTimeout(r, 3000));
  
  try {
    console.log("🔍 Running query on services...");
    const res = await db.select().from(services);
    console.log(`✅ Success! Services count: ${res.length}`);
  } catch (err: any) {
    console.error("❌ Query failed:", err.message);
  }
  
  // Close pool
  await (db as any).$client.close();
}

test();
