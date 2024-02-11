import { createTRPCRouter, publicProcedure } from "@beatmods/server/api/trpc"
import userRouter from "@beatmods/server/api/routers/user"
import modsRouter from "@beatmods/server/api/routers/mods"
import drizzleClient from "../drizzleClient"
import { desc } from "drizzle-orm"
import dbSchema from "@beatmods/types/dbSchema"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  mods: modsRouter,
  categories: publicProcedure.query(async () => {
    const categoriesResult = await drizzleClient
      .select({ name: dbSchema.categories.name })
      .from(dbSchema.categories)
    return categoriesResult?.map((category) => category.name)
  }),
  gameVersions: publicProcedure.query(async () => {
    const gameVersionsResult = await drizzleClient
      .select()
      .from(dbSchema.gameVersions)
      .orderBy(desc(dbSchema.gameVersions.version))
    return gameVersionsResult
  }),
  allUsers: publicProcedure.query(async () => {
    const users = await drizzleClient.select().from(dbSchema.githubUsers)
    return users
  }),
})

// export type definition of API
export type AppRouter = typeof appRouter
