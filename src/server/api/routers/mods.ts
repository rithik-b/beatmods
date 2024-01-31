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
import NewVersionSchema from "@beatmods/types/NewVersionSchema"
import drizzleClient from "@beatmods/server/drizzleClient"
import {
  gameVersions,
  githubUsers,
  modContributors,
  modVersionDependencies,
  modVersionSupportedGameVersions,
  modVersions,
  mods,
} from "@beatmods/types/autogen/drizzle"
import { and, count, desc, eq, inArray, max, sql } from "drizzle-orm"

const modsRouter = createTRPCRouter({
  createNew: authenticatedProcedure
    .input(NewModSchema)
    .mutation(async ({ ctx, input }) => {
      const insertResult = await drizzleClient
        .insert(mods)
        .values({
          id: input.id,
          name: input.name,
          description: !input.description ? null! : input.description,
          category: input.category,
          moreInfoUrl: input.moreInfoUrl,
          slug: createSlug(input.id),
        })
        .returning({ id: mods.id })
        .onConflictDoNothing({ target: mods.id })

      if (!insertResult[0]?.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Mod with id "${input.id}" already exists`,
        })
      }

      return insertResult[0].id
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
    .query(async ({ input }) => {
      const data = await drizzleClient
        .select({
          modVersion: {
            modId: modVersions.modId,
            version: modVersions.version,
            gameVersionId: modVersionSupportedGameVersions.gameVersionId,
          },
        })
        .from(modVersions)
        .leftJoin(
          modVersionSupportedGameVersions,
          eq(modVersionSupportedGameVersions.modVersionId, modVersions.id),
        )
        .where(inArray(modVersionSupportedGameVersions.gameVersionId, input))

      const mods = new Map<string, string[]>()
      data.forEach(({ modVersion }) => {
        const { modId, version } = modVersion

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
    .input(NewVersionSchema)
    .mutation(async ({ input }) => {
      const { modId, version } = input

      // Need to do the following validations
      // - Mod exists
      // - Mod version doesn't already exist
      // - Game version exists
      // - TODO Dependencies exist for the current game version

      const modCount = (
        await drizzleClient
          .select({ modCount: count(mods) })
          .from(mods)
          .where(eq(mods.id, modId))
          .limit(1)
      )?.[0]?.modCount

      if (modCount === 0)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Mod does not exist",
        })

      const modVersionCount = (
        await drizzleClient
          .select({ modVersionCount: count(modVersions) })
          .from(modVersions)
          .where(
            and(eq(modVersions.modId, modId), eq(modVersions.version, version)),
          )
          .limit(1)
      )?.[0]?.modVersionCount

      if (modVersionCount !== 0)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Mod version already exists",
        })

      const gameVersionCount = (
        await drizzleClient
          .select({ gameVersionCount: count(gameVersions) })
          .from(gameVersions)
          .where(eq(gameVersions.id, input.supportedGameVersionIds[0]))
          .limit(1)
      )?.[0]?.gameVersionCount

      if (gameVersionCount === 0)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Game version does not exist",
        })

      const serviceRoleClient = getSupabaseServiceRoleClient()

      return await serviceRoleClient.storage
        .from("mods")
        .createSignedUploadUrl(`${modId}/${modId}_${version}.zip`)
    }),
  createNewModVersion: modContributorProcedure
    .input(NewVersionSchema)
    .mutation(async ({ input }) => {
      const { modId, version, supportedGameVersionIds, dependencies } = input
      const serviceRoleClient = getSupabaseServiceRoleClient()
      const { data: downloadUrl } = serviceRoleClient.storage
        .from("mods")
        .getPublicUrl(`${modId}/${modId}_${version}.zip`)

      await drizzleClient.transaction(async (trx) => {
        const modVersionId = (
          await trx
            .insert(modVersions)
            .values({
              modId,
              version,
              downloadUrl: downloadUrl.publicUrl,
            })
            .returning({ id: modVersions.id })
        )[0]!.id

        await trx.insert(modVersionSupportedGameVersions).values(
          supportedGameVersionIds.map((gameVersionId) => ({
            modVersionId,
            gameVersionId,
          })),
        )

        if (dependencies.length !== 0) {
          await trx.insert(modVersionDependencies).values(
            dependencies.map((dependency) => ({
              modVersionsId: modVersionId,
              dependencyId: dependency.id,
              semver: dependency.version,
            })),
          )
        }
      })
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

  getModVersions: publicProcedure
    .input(z.object({ modId: z.string() }))
    .query(async ({ input }) => {
      const { modId } = input
      const modVersionsQuery = await drizzleClient
        .select({
          id: modVersions.id,
          version: modVersions.version,
          downloadUrl: modVersions.downloadUrl,
          dependency: {
            id: mods.id,
            version: modVersionDependencies.semver,
          },
          supportedGameVersion: gameVersions.version,
        })
        .from(modVersions)
        .leftJoin(
          modVersionSupportedGameVersions,
          eq(modVersionSupportedGameVersions.modVersionId, modVersions.id),
        )
        .leftJoin(
          gameVersions,
          eq(gameVersions.id, modVersionSupportedGameVersions.gameVersionId),
        )
        .leftJoin(
          modVersionDependencies,
          eq(modVersionDependencies.modVersionsId, modVersions.id),
        )
        .leftJoin(mods, eq(mods.id, modVersionDependencies.dependencyId))
        .where(eq(modVersions.modId, modId))
        .orderBy(desc(modVersions.version))

      const aggregatedModVersions = modVersionsQuery.reduce(
        (acc, modVersion) => {
          const { id, version, downloadUrl, dependency, supportedGameVersion } =
            modVersion

          const existingModVersion = acc.get(id)

          if (!!existingModVersion) {
            existingModVersion.dependencies = !!dependency?.id
              ? existingModVersion.dependencies.set(dependency.id, dependency)
              : existingModVersion.dependencies

            existingModVersion.supportedGameVersions = !!supportedGameVersion
              ? existingModVersion.supportedGameVersions.add(
                  supportedGameVersion,
                )
              : existingModVersion.supportedGameVersions
          } else {
            acc.set(id, {
              id,
              version,
              downloadUrl,
              dependencies: !!dependency?.id
                ? new Map([[dependency.id, dependency]])
                : new Map<string, typeof dependency>(),
              supportedGameVersions: !!supportedGameVersion
                ? new Set([supportedGameVersion])
                : new Set(),
            })
          }
          return acc
        },
        new Map<
          string,
          Omit<
            (typeof modVersionsQuery)[0],
            "dependency" | "supportedGameVersion"
          > & {
            dependencies: Map<
              string,
              Exclude<(typeof modVersionsQuery)[0]["dependency"], null>
            >
            supportedGameVersions: Set<
              Exclude<
                (typeof modVersionsQuery)[0]["supportedGameVersion"],
                null
              >
            >
          }
        >(),
      )

      return Array.from(aggregatedModVersions.values()).map((modVersion) => ({
        ...modVersion,
        supportedGameVersions: Array.from(modVersion.supportedGameVersions),
        dependencies: Array.from(modVersion.dependencies.values()),
      }))
    }),
})

export default modsRouter
