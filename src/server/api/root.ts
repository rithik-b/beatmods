import { createTRPCRouter } from "@beatmods/server/api/trpc"
import userRouter from "@beatmods/server/api/routers/user"
import modsRouter from "@beatmods/server/api/routers/mods"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    user: userRouter,
    mods: modsRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
