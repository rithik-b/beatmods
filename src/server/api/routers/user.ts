import { createTRPCRouter, authenticatedProcedure } from "../trpc"

const userRouter = createTRPCRouter({
user: authenticatedProcedure.query(async ({ctx}) => {
    return ctx.user
})})

export default userRouter
