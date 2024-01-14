import { type Database } from "@beatmods/types/supabase"
import {
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@beatmods/server/api/trpc"
import { createSlug } from "@beatmods/utils"
import newModSchema from "@beatmods/types/newModSchema"
import getSupabaseServiceRoleClient from "@beatmods/server/getSupabaseServiceRoleClient"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

const modsRouter = createTRPCRouter({
  createNew: authenticatedProcedure
    .input(newModSchema)
    .mutation(async ({ ctx, input }) => {
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
      const { error: modsError } = await serviceRoleClient
        .from("mods")
        .insert(mod)
      if (modsError)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: modsError.message,
        })

      // TODO better error handling
      const { error: contributorsError } = await serviceRoleClient
        .from("mod_contributors")
        .insert({
          mod_id: mod.id,
          user_id: ctx.user.id,
        })
      if (contributorsError)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: contributorsError.message,
        })
    }),
  modBySlug: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const { data: mod, error: modError } = await ctx.supabase
      .from("mods")
      .select("*")
      .eq("slug", input)
      .single()
    // TODO better error handling
    if (!!modError)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: modError.message,
      })
    if (!mod)
      throw new TRPCError({ code: "NOT_FOUND", message: "Mod not found" })

    const { data: contributors, error: contributorsError } = await ctx.supabase
      .from("mod_contributors")
      .select("github_users(*)")
      .eq("mod_id", mod.id)
    // TODO better error handling
    if (!!contributorsError)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: contributorsError.message,
      })
    if (!contributors || contributors.length === 0)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Contributors not found",
      })

    return { ...mod, contributors: contributors.map((c) => c.github_users!) }
  }),
})

export default modsRouter
