import {
  authenticatedProcedure,
  createTRPCRouter,
  modContributorProcedure,
  publicProcedure,
} from "@beatmods/server/api/trpc"
import { createSlug } from "@beatmods/utils"
import NewModSchema from "@beatmods/types/NewModSchema"
import getSupabaseServiceRoleClient from "@beatmods/server/getSupabaseServiceRoleClient"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import NewVersionSchema, {
  NewVersionSchemaWithoutUploadPath,
} from "@beatmods/types/NewVersionSchema"

const modsRouter = createTRPCRouter({
  createNew: authenticatedProcedure
    .input(NewModSchema)
    .mutation(async ({ ctx, input }) => {
      const serviceRoleClient = getSupabaseServiceRoleClient()

      const { error } = await serviceRoleClient.rpc("new_mod", {
        id: input.id,
        name: input.name,
        description: !input.description ? null! : input.description,
        category: input.category,
        more_info_url: input.moreInfoUrl,
        slug: createSlug(input.id),
        user_id: ctx.user.id,
      })

      if (error) {
        if (error.code === "23505")
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Mod already exists",
          })
        else
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          })
      }
    }),
  modBySlug: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const { data: mod, error: modError } = await ctx.supabase
      .from("mods")
      .select("*")
      .eq("slug", input)
      .single()

    if (!!modError) {
      if (modError.code === "PGRST116")
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Mod not found",
        })

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: modError.message,
      })
    }

    const { data: contributors, error: contributorsError } = await ctx.supabase
      .from("mod_contributors")
      .select("github_users(*)")
      .eq("mod_id", mod.id)

    if (!!contributorsError)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: contributorsError.message,
      })

    return { ...mod, contributors: contributors.map((c) => c.github_users!) }
  }),
  // TODO look for lowest version that supports all game versions
  getModsForGameVersions: publicProcedure
    .input(z.array(z.string()))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("mod_version_supported_game_versions")
        .select("mod_versions(mod_id, version)")
        .in("game_version_id", input)

      // TODO better error handling
      if (!!error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        })

      const mods = new Map<string, string[]>()
      data.forEach(({ mod_versions }) => {
        const modId = mod_versions?.mod_id
        const version = mod_versions?.version

        if (!modId || !version) return

        if (mods.has(modId)) {
          mods.get(modId)?.push(version)
        } else {
          mods.set(modId, [version])
        }
      })

      return mods
    }),
  getUploadUrlForNewModVersion: modContributorProcedure
    .input(NewVersionSchemaWithoutUploadPath)
    .mutation(async ({ ctx, input }) => {
      const { modId, version } = input
      const serviceRoleClient = getSupabaseServiceRoleClient()
      // TODO validation
      return await serviceRoleClient.storage
        .from("mods")
        .createSignedUploadUrl(`${modId}/${modId}_${version}.zip`)
    }),
  createNewModVersion: modContributorProcedure
    .input(NewVersionSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        modId,
        version,
        supportedGameVersionIds,
        dependencies,
        uploadPath,
      } = input
      const serviceRoleClient = getSupabaseServiceRoleClient()
      const { data: downloadUrl } = serviceRoleClient.storage
        .from("mods")
        .getPublicUrl(uploadPath)

      // TODO better error handling
      const { data, error: versionsError } = await serviceRoleClient
        .from("mod_versions")
        .insert({
          mod_id: modId,
          version,
          download_url: downloadUrl.publicUrl,
        })
        .select("id")
      if (versionsError)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: versionsError.message,
        })

      // TODO better error handling
      const { error: gameVersionsError } = await serviceRoleClient
        .from("mod_version_supported_game_versions")
        .insert(
          supportedGameVersionIds.map((gameVersionId) => ({
            mod_version_id: data[0]!.id,
            game_version_id: gameVersionId,
          })),
        )
      if (gameVersionsError)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: gameVersionsError.message,
        })

      if (dependencies.length !== 0) {
        // TODO better error handling
        const { error: dependenciesError } = await serviceRoleClient
          .from("mod_version_dependencies")
          .insert(
            dependencies.map((dependency) => ({
              mod_versions_id: data[0]!.id,
              dependency_id: dependency.id,
              semver: dependency.version,
            })),
          )
        if (dependenciesError)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: dependenciesError.message,
          })
      }
    }),
  getModsForListing: publicProcedure.query(async () => {
    const serviceRoleClient = getSupabaseServiceRoleClient()
    const { data, error } = await serviceRoleClient.rpc("get_mods_listing")
    // TODO better error handling
    if (!!error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      })
    return data
  }),
})

export default modsRouter
