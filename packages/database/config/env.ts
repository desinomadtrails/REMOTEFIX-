import { z } from "zod";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from standard workspace levels
export function loadEnvFiles() {
  dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
  dotenv.config();
}

loadEnvFiles();

const envSchema = z.object({
  DB_HOST: z.string().optional(),
  DB_PORT: z
    .union([z.string(), z.number()])
    .optional()
    .default(1433)
    .transform((val) => (typeof val === "number" ? val : parseInt(val, 10) || 1433)),
  DB_NAME: z.string().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DATABASE_URL: z.string().optional(),
});

export function getDbEnv() {
  loadEnvFiles();
  const parsed = envSchema.safeParse(process.env);
  if (parsed.success) {
    return parsed.data;
  }
  return {
    DB_HOST: process.env.DB_HOST || "",
    DB_PORT: parseInt(process.env.DB_PORT || "1433", 10) || 1433,
    DB_NAME: process.env.DB_NAME || "",
    DB_USER: process.env.DB_USER || "",
    DB_PASSWORD: process.env.DB_PASSWORD || "",
    DATABASE_URL: process.env.DATABASE_URL || "",
  };
}

export const env = new Proxy({}, {
  get(_target, prop) {
    const current = getDbEnv() as any;
    return current[prop];
  }
}) as ReturnType<typeof getDbEnv>;

