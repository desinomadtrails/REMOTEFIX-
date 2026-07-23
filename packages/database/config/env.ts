import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from standard workspace levels
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config();

const envSchema = z.object({
  DB_HOST: z.string().optional(),
  DB_PORT: z
    .string()
    .optional()
    .default("1433")
    .transform((val) => parseInt(val, 10)),
  DB_NAME: z.string().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

// Export parsed variables or fallback structure for compile verification
export const env = parsed.success ? parsed.data : { DB_PORT: 1433 } as any;
