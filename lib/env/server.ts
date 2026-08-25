import "server-only";

import { z } from "zod";

const databaseDeploymentEnvSchema = z.object({
  SUPABASE_ACCESS_TOKEN: z.string().min(1),
  SUPABASE_DB_PASSWORD: z.string().min(1),
  SUPABASE_PROJECT_ID: z.string().min(1),
});

export function getDatabaseDeploymentEnv() {
  return databaseDeploymentEnvSchema.parse({
    SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN,
    SUPABASE_DB_PASSWORD: process.env.SUPABASE_DB_PASSWORD,
    SUPABASE_PROJECT_ID: process.env.SUPABASE_PROJECT_ID,
  });
}
