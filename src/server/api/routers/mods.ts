import { type Database } from "@beatmods/types/supabase"
import { authenticatedProcedure, createTRPCRouter } from "../trpc"
import { createSlug } from "@beatmods/utils"
import newModSchema from "@beatmods/types/newModSchema"
import getSupabaseServiceRoleClient from "@beatmods/server/getSupaBaseServiceRoleClient"
import { TRPCError } from "@trpc/server"

const modsRouter = createTRPCRouter({
createNew: authenticatedProcedure.input(newModSchema).mutation(async ({ctx, input}) => {
    if (!input.description) input.description = undefined

    const mod: Database["public"]["Tables"]["mods"]["Insert"] = {
        id: input.id,
        name: input.name,
        description: input.description,
        category: input.category,
        more_info_url: input.moreInfoUrl,
        slug: createSlug(input.id),
    }

    const serviceRoleClient = getSupabaseServiceRoleClient()

    // TODO better error handling
    const {error: modsError} = await serviceRoleClient.from("mods").insert(mod)
    if (modsError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: modsError.message })

    // TODO better error handling
    const {error: contributorsError} = await serviceRoleClient.from("mod_contributors").insert({
        mod_id: mod.id,
        user_id: ctx.user.id,
    })
    if (contributorsError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: contributorsError.message })
})})

export default modsRouter
