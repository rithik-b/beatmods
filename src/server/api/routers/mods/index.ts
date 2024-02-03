import {
  authenticatedProcedure,
  createTRPCRouter,
  modContributorProcedure,
  publicProcedure,
} from "@beatmods/server/api/trpc"
import { createSlug } from "@beatmods/utils"
import NewModSchema from "@beatmods/types/NewModSchema"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import drizzleClient from "@beatmods/server/drizzleClient"
import {
  gameVersions,
  githubUsers,
  modContributors,
  modVersionSupportedGameVersions,
  modVersions,
  mods,
} from "@beatmods/types/autogen/drizzle"
import { and, count, eq, max, sql } from "drizzle-orm"
import versionsRouter from "./versions"

const modsRouter = createTRPCRouter({
  createNew: authenticatedProcedure
    .input(NewModSchema)
    .mutation(async ({ ctx, input }) => {
      const insertResult = await drizzleClient.transaction(async (trx) => {
        const result = await trx
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

        if (!result[0]?.id) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Mod with id "${input.id}" already exists`,
          })
        }

        await trx.insert(modContributors).values({
          modId: result[0].id,
          userId: ctx.user.id,
        })

        return result
      })

      return insertResult[0]!.id
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

  addModContributors: modContributorProcedure
    .input(z.object({ modId: z.string(), userIds: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      await drizzleClient
        .insert(modContributors)
        .values(input.userIds.map((userId) => ({ modId: input.modId, userId })))
    }),

  removeModContributor: modContributorProcedure
    .input(z.object({ modId: z.string(), userId: z.string() }))
    .mutation(async ({ input }) => {
      const contributorCount = await drizzleClient
        .select({ count: count(modContributors) })
        .from(modContributors)
        .where(eq(modContributors.modId, input.modId))

      if (!contributorCount[0]?.count || contributorCount[0]?.count <= 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot remove last contributor",
        })
      }

      await drizzleClient
        .delete(modContributors)
        .where(
          and(
            eq(modContributors.modId, input.modId),
            eq(modContributors.userId, input.userId),
          ),
        )
    }),

  versions: versionsRouter,
})

export default modsRouter
