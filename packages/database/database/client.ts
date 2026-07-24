import { drizzle } from "drizzle-orm/node-mssql";
import mssql from "mssql";
import { env } from "../config/env.js";
import * as schema from "./schema/index.js";

export type DbClient = ReturnType<typeof createDb>;

export const connectionConfig: mssql.config = {
  server: env.DB_HOST || "",
  port: env.DB_PORT || 1433,
  database: env.DB_NAME || "",
  user: env.DB_USER || "",
  password: env.DB_PASSWORD || "",
  options: {
    encrypt: true,
    trustServerCertificate: true,
    cryptoCredentialsDetails: {
      minVersion: "TLSv1.2"
    }
  },
};

export function parseConnectionString(connectionString: string): mssql.config {
  const config: any = {
    options: {
      encrypt: true,
      trustServerCertificate: true,
      cryptoCredentialsDetails: {
        minVersion: "TLSv1.2"
      }
    }
  };

  const parts = connectionString.split(";");
  for (const part of parts) {
    const eqIndex = part.indexOf("=");
    if (eqIndex === -1) continue;

    const key = part.substring(0, eqIndex).trim().toLowerCase();
    const value = part.substring(eqIndex + 1).trim();

    if (key === "server") {
      const hostParts = value.split(",");
      config.server = hostParts[0];
      if (hostParts[1]) {
        config.port = parseInt(hostParts[1], 10);
      }
    } else if (key === "database") {
      config.database = value;
    } else if (key === "user id" || key === "user") {
      config.user = value;
    } else if (key === "password") {
      config.password = value;
    } else if (key === "encrypt") {
      config.options.encrypt = value.toLowerCase() === "true";
    } else if (key === "trustservercertificate") {
      config.options.trustServerCertificate = value.toLowerCase() === "true";
    }
  }

  return config;
}

export function createDb(connectionStringOrConfig?: string | mssql.config) {
  let pool: mssql.ConnectionPool;

  if (connectionStringOrConfig) {
    if (typeof connectionStringOrConfig === "string") {
      const parsedConfig = parseConnectionString(connectionStringOrConfig);
      pool = new mssql.ConnectionPool(parsedConfig);
    } else {
      pool = new mssql.ConnectionPool(connectionStringOrConfig);
    }
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

export async function getConnectedDbClient() {
  if (!connectionConfig.server || !connectionConfig.database || !connectionConfig.user || !connectionConfig.password) {
    throw new Error("❌ Database configuration properties are missing in process.env!");
  }
  const pool = new mssql.ConnectionPool(connectionConfig);
  await pool.connect();
  return drizzle({
    client: pool,
    schema,
  });
}
