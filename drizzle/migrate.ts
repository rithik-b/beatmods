import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"
import { env } from "process"

const connectionString = env.SUPABASE_DB_URL!
const connection = postgres(connectionString)
const drizzleClient = drizzle(connection)

// This will run migrations on the database, skipping the ones already applied
await migrate(drizzleClient, { migrationsFolder: "./drizzle" })
await connection.end()
