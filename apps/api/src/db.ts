import { createDb, DbClient } from "@remotefix/database";

let dbInstance: DbClient | null = null;

export function getDb(databaseUrl: string): DbClient {
  if (!dbInstance) {
    dbInstance = createDb(databaseUrl);
  }
  return dbInstance;
}
