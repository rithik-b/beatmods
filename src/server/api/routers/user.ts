import { createTRPCRouter, publicProcedure } from "../trpc"

const userRouter = createTRPCRouter({
user: publicProcedure.query(async ({ctx}) => {
    return await ctx.supabase.auth.getUser()
})})

export default userRouter
