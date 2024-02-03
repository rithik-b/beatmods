import { categoriesTable, gameVersionsTable } from "@beatmods/types/drizzle"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { env } from "process"

const connectionString = env.SUPABASE_DB_URL!
const connection = postgres(connectionString)
const drizzleClient = drizzle(connection)

await drizzleClient.insert(categoriesTable).values([
  {
    name: "Core",
    description: "Core Mods",
  },
  {
    name: "Leaderboards",
    description: "Mods which change Beat Saber's leaderboard experience",
  },
])

await drizzleClient.insert(gameVersionsTable).values([
  {
    version: "1.29.1",
    published: true,
  },
  {
    version: "1.34.2",
    published: true,
  },
])

await connection.end()
