import {
  categoriesTable,
  gameVersionsTable,
  githubUsersTable,
  modsTable,
  modVersionsTable,
  modVersionSupportedGameVersionsTable,
  modContributorsTable,
} from "@beatmods/types/dbSchema"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { env } from "process"

const connectionString = env.SUPABASE_DB_URL!
const connection = postgres(connectionString)
const drizzleClient = drizzle(connection)

type MockId = {
  id: string
}

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

const mockGameVersions: MockId[] = await drizzleClient
  .insert(gameVersionsTable)
  .values([
    {
      version: "1.29.1",
      published: true,
    },
    {
      version: "1.34.2",
      published: true,
    },
  ])
  .returning()

const mockUsers: MockId[] = await drizzleClient
  .insert(githubUsersTable)
  .values([
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
  .returning()

await drizzleClient.insert(modsTable).values([
  {
    id: "Bocchi the Mod",
    name: "Bocchi the Mod",
    slug: "bocchi-the-mod",
    description: "Adds social anxiety to the game (just like Bocchi fr fr)",
    moreInfoUrl: "https://fortnite.com",
    category: "Core",
  },
])

const mockModVersion: MockId[] = await drizzleClient
  .insert(modVersionsTable)
  .values([
    {
      modId: "Bocchi the Mod",
      version: "1.0.0",
      downloadUrl:
        "https://static.wikia.nocookie.net/bocchi-the-rock/images/3/32/Episode_2-3.png",
    },
  ])
  .returning()

await drizzleClient.insert(modVersionSupportedGameVersionsTable).values([
  {
    modVersionId: mockModVersion[0]!.id,
    gameVersionId: mockGameVersions[1]!.id,
  },
])

await drizzleClient.insert(modContributorsTable).values([
  {
    modId: "Bocchi the Mod",
    userId: mockUsers[0]!.id,
  },
])

await connection.end()
