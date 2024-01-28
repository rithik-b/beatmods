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
import drizzleClient from "@beatmods/server/drizzleClient"
import {
  gameVersions,
  githubUsers,
  modContributors,
  modVersionSupportedGameVersions,
  modVersions,
  mods,
} from "@beatmods/types/autogen/drizzle"
import { and, eq, max, sql } from "drizzle-orm"

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
  modBySlug: publicProcedure.input(z.string()).query(async ({ input }) => {
    const mod = (
      await drizzleClient
        .select()
        .from(mods)
        .where(eq(mods.slug, input))
        .limit(1)
    )?.[0]

    if (!mod)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Mod not found",
      })

    const contributors = await drizzleClient
      .select({
        id: githubUsers.id,
        name: githubUsers.name,
        userName: githubUsers.userName,
        avatarUrl: githubUsers.avatarUrl,
        createdAt: githubUsers.createdAt,
      })
      .from(githubUsers)
      .leftJoin(modContributors, eq(modContributors.userId, githubUsers.id))
      .where(eq(modContributors.modId, mod.id))

    return {
      ...mod,
      contributors,
    }
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
    .mutation(async ({ input }) => {
      const { modId, version } = input
      const serviceRoleClient = getSupabaseServiceRoleClient()
      // TODO validation
      return await serviceRoleClient.storage
        .from("mods")
        .createSignedUploadUrl(`${modId}/${modId}_${version}.zip`)
    }),
  createNewModVersion: modContributorProcedure
    .input(NewVersionSchema)
    .mutation(async ({ input }) => {
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
  getModsForListing: publicProcedure
    .input(
      z.object({
        gameVersion: z.string(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { gameVersion, search } = input
      const unAggregatedMods = await drizzleClient
        .select({
          id: mods.id,
          name: mods.name,
          slug: mods.slug,
          category: mods.category,
          contributor: githubUsers,
          supportedGameVersion: gameVersions.version,
          latestVersion: max(modVersions.version),
        })
        .from(mods)
        .leftJoin(modContributors, eq(modContributors.modId, mods.id))
        .leftJoin(githubUsers, eq(githubUsers.id, modContributors.userId))
        .leftJoin(modVersions, eq(modVersions.modId, mods.id))
        .leftJoin(
          modVersionSupportedGameVersions,
          eq(modVersionSupportedGameVersions.modVersionId, modVersions.id),
        )
        .leftJoin(
          gameVersions,
          eq(gameVersions.id, modVersionSupportedGameVersions.gameVersionId),
        )
        .where(
          and(
            eq(gameVersions.version, gameVersion),
            // TODO improve search
            !!search
              ? sql`${search} % ANY(STRING_TO_ARRAY(${mods.name},' '))`
              : sql`TRUE`,
          ),
        )
        .groupBy(mods.id, githubUsers.id, gameVersions.id)

      const aggregatedMods = unAggregatedMods.reduce(
        (acc, mod) => {
          const {
            id,
            name,
            slug,
            category,
            latestVersion,
            contributor,
            supportedGameVersion,
          } = mod

          const existingMod = acc.get(id)

          if (!!existingMod) {
            existingMod.contributors = !!contributor
              ? [...existingMod.contributors, contributor]
              : existingMod.contributors

            existingMod.supportedGameVersions = !!supportedGameVersion
              ? [...existingMod.supportedGameVersions, supportedGameVersion]
              : existingMod.supportedGameVersions
          } else {
            acc.set(id, {
              id,
              name,
              slug,
              category,
              latestVersion,
              contributors: !!contributor ? [contributor] : [],
              supportedGameVersions: !!supportedGameVersion
                ? [supportedGameVersion]
                : [],
            })
          }
          return acc
        },
        new Map<
          string,
          Omit<
            (typeof unAggregatedMods)[0],
            "contributor" | "supportedGameVersion" | "version"
          > & {
            contributors: Exclude<
              (typeof unAggregatedMods)[0]["contributor"],
              null
            >[]
            supportedGameVersions: Exclude<
              (typeof unAggregatedMods)[0]["supportedGameVersion"],
              null
            >[]
          }
        >(),
      )

      return Array.from(aggregatedMods.values())
    }),
})

export default modsRouter
