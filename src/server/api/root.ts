import { createTRPCRouter, publicProcedure } from "@beatmods/server/api/trpc"
import userRouter from "@beatmods/server/api/routers/user"
import modsRouter from "@beatmods/server/api/routers/mods"
import drizzleClient from "../drizzleClient"
import { categories, gameVersions } from "@beatmods/types/autogen/drizzle"

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
      .select({ name: categories.name })
      .from(categories)
    return categoriesResult?.map((category) => category.name)
  }),
  gameVersions: publicProcedure.query(async () => {
    const gameVersionsResult = await drizzleClient.select().from(gameVersions)
    return gameVersionsResult
  }),
})

// export type definition of API
export type AppRouter = typeof appRouter
