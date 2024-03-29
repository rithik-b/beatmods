"server only"

import { env } from "@beatmods/env"
import * as dbSchema from "@beatmods/types/dbSchema"
import { dbSchemaRelations } from "@beatmods/types/dbSchema"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

const connectionString = env.SUPABASE_DB_URL
const connection = postgres(connectionString)
export default drizzle(connection, {
  schema: { ...dbSchema, ...dbSchemaRelations },
})
