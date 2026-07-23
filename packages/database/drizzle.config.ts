import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config();

const { DB_HOST, DB_PORT = "1433", DB_NAME, DB_USER, DB_PASSWORD } = process.env;

// Construct MSSQL connection string with strict encryption and certificate settings
const connectionString = `Server=${DB_HOST},${DB_PORT};Database=${DB_NAME};User Id=${DB_USER};Password=${DB_PASSWORD};Encrypt=true;TrustServerCertificate=false;`;

export default defineConfig({
  out: "./database/migrations",
  schema: "./database/schema/index.ts",
  dialect: "mssql",
  dbCredentials: {
    url: connectionString,
  },
});
