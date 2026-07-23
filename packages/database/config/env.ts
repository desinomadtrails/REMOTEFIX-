import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Load env files from root or local workspace folders
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config();

const envSchema = z.object({
  DB_HOST: z.string().min(1, "DB_HOST is required"),
  DB_PORT: z
    .string()
    .default("1433")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
  DB_NAME: z.string().min(1, "DB_NAME is required"),
  DB_USER: z.string().min(1, "DB_USER is required"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid database environment configuration:", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
