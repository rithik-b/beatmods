"server only"

import { env } from "@beatmods/env"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

const connectionString = env.SUPABASE_DB_URL
const client = postgres(connectionString)
export default drizzle(client)
