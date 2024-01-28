import type { Config } from "drizzle-kit"
export default {
  schema: "./src/types/drizzle.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.SUPABASE_DB_URL!,
  },
} satisfies Config
