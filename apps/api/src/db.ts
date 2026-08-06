import { createDb, DbClient, ensurePoolConnected, getDbConfig } from "@remotefix/database";
import mssql from "mssql";

let dbInstance: DbClient | null = null;
let initPromise: Promise<DbClient> | null = null;
let isConnected = false;
let lastInitError: string | null = null;

export async function initializeDb(databaseUrl?: string): Promise<DbClient> {
  if (dbInstance && isConnected) {
    const pool = (dbInstance as any).$client as mssql.ConnectionPool;
    if (pool && pool.connected) {
      return dbInstance;
    }
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const config = getDbConfig(databaseUrl);
      const pool = new mssql.ConnectionPool(config);
      await ensurePoolConnected(pool, 5, 1000);

      dbInstance = createDb(config);
      // Ensure existing drizzle client uses our fully connected pool
      (dbInstance as any).$client = pool;
      isConnected = true;
      lastInitError = null;
      return dbInstance;
    } catch (err: any) {
      isConnected = false;
      lastInitError = err.message || String(err);
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

export function getDb(databaseUrl?: string): DbClient {
  if (!dbInstance) {
    dbInstance = createDb(databaseUrl);
  }
  return dbInstance;
}

export async function getDbAsync(databaseUrl?: string): Promise<DbClient> {
  if (dbInstance && isConnected) {
    const pool = (dbInstance as any).$client as mssql.ConnectionPool;
    if (pool && pool.connected) {
      return dbInstance;
    }
  }
  return initializeDb(databaseUrl);
}

export function isDbConnected(): boolean {
  if (!dbInstance) return false;
  const pool = (dbInstance as any).$client as mssql.ConnectionPool;
  return Boolean(pool && pool.connected);
}

export function getDbStatusDetails() {
  const pool = dbInstance ? ((dbInstance as any).$client as mssql.ConnectionPool) : null;
  return {
    connected: pool ? Boolean(pool.connected) : false,
    connecting: pool ? Boolean(pool.connecting) : false,
    lastError: lastInitError,
  };
}

export async function closeDb(): Promise<void> {
  if (dbInstance) {
    const pool = (dbInstance as any).$client as mssql.ConnectionPool;
    if (pool && (pool.connected || pool.connecting)) {
      try {
        await pool.close();
      } catch (err) {
        console.error("⚠️ Error closing database pool:", err);
      }
    }
    dbInstance = null;
    initPromise = null;
    isConnected = false;
  }
}

