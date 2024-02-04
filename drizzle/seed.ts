import {
  categoriesTable,
  gameVersionsTable,
  githubUsersTable,
} from "@beatmods/types/drizzle"
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

await drizzleClient.insert(githubUsersTable).values([
  {
    userName: "Bocchi",
    name: "Hitori Gotoh",
    avatarUrl:
      "https://static.wikia.nocookie.net/bocchi-the-rock/images/6/67/Hitori_Gotoh_Profile.png",
  },
  {
    userName: "Nijika Ijichi",
    avatarUrl:
      "https://static.wikia.nocookie.net/bocchi-the-rock/images/b/be/Nijika_Ijichi_Profile.png",
  },
  {
    userName: "Ryo Yamada",
    avatarUrl:
      "https://static.wikia.nocookie.net/bocchi-the-rock/images/1/1d/Ryo_Yamada_Profile.png",
  },
  {
    userName: "Ikuyo Kita",
    avatarUrl:
      "https://static.wikia.nocookie.net/bocchi-the-rock/images/7/7a/Ikuyo_Kita_Profile.png",
  },
  {
    userName: "Kikuri Hiroi",
    avatarUrl:
      "https://static.wikia.nocookie.net/bocchi-the-rock/images/8/88/Kikuri_Hiroi.png",
  },
])

await connection.end()
