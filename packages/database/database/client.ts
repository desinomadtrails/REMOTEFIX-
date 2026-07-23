import { drizzle } from "drizzle-orm/node-mssql";
import mssql from "mssql";
import { env } from "../config/env.js";
import * as schema from "./schema/index.js";

export type DbClient = ReturnType<typeof createDb>;

export const connectionConfig: mssql.config = {
  server: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  options: {
    encrypt: true, // Mandatory Encryption
    trustServerCertificate: false, // Strict certificate validation (do not trust self-signed certs)
  },
};

export function createDb(connectionStringOrConfig?: string | mssql.config) {
  let pool: mssql.ConnectionPool;

  if (connectionStringOrConfig) {
    pool = new mssql.ConnectionPool(connectionStringOrConfig);
  } else {
    pool = new mssql.ConnectionPool(connectionConfig);
  }

  pool.connect().catch((err) => {
    console.error("❌ Failed to connect to Azure SQL Database:", err);
  });

  return drizzle({
    client: pool,
    schema,
  });
}

// Helper to get a fully connected database client for scripts
export async function getConnectedDbClient() {
  const pool = new mssql.ConnectionPool(connectionConfig);
  await pool.connect();
  return drizzle({
    client: pool,
    schema,
  });
}
