import { migrate } from "drizzle-orm/node-mssql/migrator";
import { getConnectedDbClient } from "../client.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log("🚀 Starting database migration...");
  
  try {
    const db = await getConnectedDbClient();
    await migrate(db, {
      migrationsFolder: path.resolve(__dirname, "../migrations"),
    });
    console.log("✅ Database migration completed successfully!");
    
    // Close connection pool to exit cleanly
    await db.$client.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ Database migration failed:", err);
    process.exit(1);
  }
}

run();
