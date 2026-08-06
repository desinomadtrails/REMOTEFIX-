import { drizzle } from "drizzle-orm/node-mssql";
import mssql from "mssql";
import { getDbEnv, env } from "../config/env.js";
import * as schema from "./schema/index.js";

export type DbClient = ReturnType<typeof createDb>;

export function getDbConfig(connectionStringOrConfig?: string | mssql.config): mssql.config {
  if (connectionStringOrConfig) {
    if (typeof connectionStringOrConfig === "string") {
      return parseConnectionString(connectionStringOrConfig);
    } else {
      return mergeDefaultConfig(connectionStringOrConfig);
    }
  }

  const currentEnv = getDbEnv();
  const host = currentEnv.DB_HOST || process.env.DB_HOST || "";
  const port = currentEnv.DB_PORT || parseInt(process.env.DB_PORT || "1433", 10) || 1433;
  const database = currentEnv.DB_NAME || process.env.DB_NAME || "";
  const user = currentEnv.DB_USER || process.env.DB_USER || "";
  const password = currentEnv.DB_PASSWORD || process.env.DB_PASSWORD || "";

  return mergeDefaultConfig({
    server: host,
    port,
    database,
    user,
    password,
  });
}

function mergeDefaultConfig(base: mssql.config): mssql.config {
  return {
    ...base,
    connectionTimeout: base.connectionTimeout ?? 30000,
    requestTimeout: base.requestTimeout ?? 30000,
    pool: {
      max: base.pool?.max ?? 10,
      min: base.pool?.min ?? 0,
      idleTimeoutMillis: base.pool?.idleTimeoutMillis ?? 30000,
      acquireTimeoutMillis: base.pool?.acquireTimeoutMillis ?? 30000,
    },
    options: {
      encrypt: base.options?.encrypt ?? true,
      trustServerCertificate: base.options?.trustServerCertificate ?? true,
      cryptoCredentialsDetails: base.options?.cryptoCredentialsDetails ?? {
        minVersion: "TLSv1.2",
      },
      connectTimeout: base.options?.connectTimeout ?? 30000,
      requestTimeout: base.options?.requestTimeout ?? 30000,
      ...base.options,
    },
  };
}

export const connectionConfig: mssql.config = new Proxy({}, {
  get(_target, prop) {
    const config = getDbConfig() as any;
    return config[prop];
  }
}) as mssql.config;

export function parseConnectionString(connectionString: string): mssql.config {
  const config: any = mergeDefaultConfig({
    server: "",
    database: "",
    user: "",
    password: "",
  });

  const parts = connectionString.split(";");
  for (const part of parts) {
    const eqIndex = part.indexOf("=");
    if (eqIndex === -1) continue;

    const key = part.substring(0, eqIndex).trim().toLowerCase();
    const value = part.substring(eqIndex + 1).trim();

    if (key === "server" || key === "data source" || key === "host" || key === "address") {
      const hostParts = value.split(",");
      config.server = hostParts[0];
      if (hostParts[1]) {
        config.port = parseInt(hostParts[1], 10);
      }
    } else if (key === "port") {
      config.port = parseInt(value, 10);
    } else if (key === "database" || key === "initial catalog") {
      config.database = value;
    } else if (key === "user id" || key === "user" || key === "uid") {
      config.user = value;
    } else if (key === "password" || key === "pwd") {
      config.password = value;
    } else if (key === "encrypt") {
      config.options.encrypt = value.toLowerCase() === "true";
    } else if (key === "trustservercertificate" || key === "trust server certificate") {
      config.options.trustServerCertificate = value.toLowerCase() === "true";
    } else if (key === "connectiontimeout" || key === "connect timeout" || key === "timeout") {
      const timeoutMs = parseInt(value, 10) * 1000;
      if (!isNaN(timeoutMs)) {
        config.connectionTimeout = timeoutMs;
        config.options.connectTimeout = timeoutMs;
      }
    } else if (key === "requesttimeout") {
      const timeoutMs = parseInt(value, 10) * 1000;
      if (!isNaN(timeoutMs)) {
        config.requestTimeout = timeoutMs;
        config.options.requestTimeout = timeoutMs;
      }
    }
  }

  return mergeDefaultConfig(config);
}

export async function ensurePoolConnected(
  pool: mssql.ConnectionPool,
  maxRetries = 5,
  baseDelayMs = 1000
): Promise<mssql.ConnectionPool> {
  if (pool.connected) {
    return pool;
  }

  const config = (pool as any).config as mssql.config;
  const host = config?.server || "unknown";
  const port = config?.port || 1433;
  const dbName = config?.database || "unknown";
  const hasUser = Boolean(config?.user);
  const hasPassword = Boolean(config?.password);

  console.log(`🔌 Initializing Azure SQL Connection Pool...`);
  console.log(`   📍 DB_HOST: ${host}`);
  console.log(`   📍 DB_PORT: ${port}`);
  console.log(`   📍 DB_NAME: ${dbName}`);
  console.log(`   🔑 DB_USER: ${hasUser ? "Present" : "Missing"}`);
  console.log(`   🔒 DB_PASSWORD: ${hasPassword ? "Present" : "Missing"}`);

  let attempt = 0;
  let lastError: any = null;

  while (attempt < maxRetries) {
    attempt++;
    const startTime = Date.now();
    try {
      console.log(`⏳ Attempting database connection (Attempt ${attempt}/${maxRetries})...`);
      await pool.connect();
      const durationMs = Date.now() - startTime;
      console.log(`✅ Azure SQL Database connected successfully! (Latency: ${durationMs}ms)`);
      return pool;
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      lastError = err;
      console.error(`❌ Connection attempt ${attempt}/${maxRetries} failed in ${durationMs}ms:`, err.message || err);

      if (attempt < maxRetries) {
        const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
        console.log(`🔄 Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw new Error(`❌ Failed to connect to Azure SQL Database after ${maxRetries} attempts: ${lastError?.message || lastError}`);
}

export function createDb(connectionStringOrConfig?: string | mssql.config) {
  const config = getDbConfig(connectionStringOrConfig);
  const pool = new mssql.ConnectionPool(config);

  // Trigger non-blocking connection in background for backward compatibility,
  // but log any connection issues clearly.
  if (!pool.connecting && !pool.connected) {
    ensurePoolConnected(pool, 3, 1000).catch((err) => {
      console.error("❌ Background pool initialization warning:", err.message || err);
    });
  }

  return drizzle({
    client: pool,
    schema,
  });
}

export async function getConnectedDbClient(connectionStringOrConfig?: string | mssql.config) {
  const config = getDbConfig(connectionStringOrConfig);
  if (!config.server || !config.database || !config.user || !config.password) {
    throw new Error(`❌ Database configuration incomplete! Host: "${config.server}", DB: "${config.database}", User: "${config.user ? "set" : "missing"}", Password: "${config.password ? "set" : "missing"}"`);
  }
  const pool = new mssql.ConnectionPool(config);
  await ensurePoolConnected(pool);
  return drizzle({
    client: pool,
    schema,
  });
}

