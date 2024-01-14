import { createTRPCRouter, publicProcedure } from "@beatmods/server/api/trpc"
import userRouter from "@beatmods/server/api/routers/user"
import modsRouter from "@beatmods/server/api/routers/mods"
import { TRPCError } from "@trpc/server"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    user: userRouter,
    mods: modsRouter,
    categories: publicProcedure.query(async ({ctx}) => {
        const categories = await ctx.supabase.from("categories").select("name")
        // TODO better error handling
        if (categories.error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: categories.error.message })
        return categories.data?.map(category => category.name)
    }),
})

// export type definition of API
export type AppRouter = typeof appRouter
