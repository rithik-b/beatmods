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
  gameVersionsTable,
  githubUsersTable,
  modContributorsTable,
  modVersionSupportedGameVersionsTable,
  modVersionsTable,
  modsTable,
} from "@beatmods/types/drizzle"
import { and, count, eq, max, sql } from "drizzle-orm"
import versionsRouter, { createNewModVersion } from "./versions"
import NewVersionSchema from "@beatmods/types/NewVersionSchema"

const modsRouter = createTRPCRouter({
  validateNew: authenticatedProcedure
    .input(NewModSchema)
    .mutation(async ({ input }) => {
      const potentialDuplicateCount = (
        await drizzleClient
          .select({ count: count(modsTable) })
          .from(modsTable)
          .where(eq(modsTable.id, input.id))
      )?.[0]?.count

      if (potentialDuplicateCount && potentialDuplicateCount > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Mod with id "${input.id}" already exists`,
        })
      }
    }),

  createNew: authenticatedProcedure
    .input(
      z.object({
        mod: NewModSchema,
        version: NewVersionSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const insertResult = await drizzleClient.transaction(async (trx) => {
        const result = await trx
          .insert(modsTable)
          .values({
            id: input.mod.id,
            name: input.mod.name,
            description: !input.mod.description ? null : input.mod.description,
            category: input.mod.category,
            moreInfoUrl: input.mod.moreInfoUrl,
            slug: createSlug(input.mod.id),
          })
          .returning({ id: modsTable.id, slug: modsTable.slug })
          .onConflictDoNothing({ target: modsTable.id })

        if (!result[0]?.id) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Mod with id "${input.mod.id}" already exists`,
          })
        }

        await trx.insert(modContributorsTable).values({
          modId: result[0].id,
          userId: ctx.user.id,
        })

        await createNewModVersion(input.version, trx)

        return result
      })

      return insertResult[0]!.slug
    }),

  modBySlug: publicProcedure.input(z.string()).query(async ({ input }) => {
    const mod = (
      await drizzleClient
        .select()
        .from(modsTable)
        .where(eq(modsTable.slug, input))
        .limit(1)
    )?.[0]

    if (!mod)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Mod not found",
      })

    const contributors = await drizzleClient
      .select({
        id: githubUsersTable.id,
        name: githubUsersTable.name,
        userName: githubUsersTable.userName,
        avatarUrl: githubUsersTable.avatarUrl,
        createdAt: githubUsersTable.createdAt,
      })
      .from(githubUsersTable)
      .leftJoin(
        modContributorsTable,
        eq(modContributorsTable.userId, githubUsersTable.id),
      )
      .where(eq(modContributorsTable.modId, mod.id))

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
          id: modsTable.id,
          name: modsTable.name,
          slug: modsTable.slug,
          category: modsTable.category,
          contributor: githubUsersTable,
          supportedGameVersion: gameVersionsTable.version,
          latestVersion: max(modVersionsTable.version),
        })
        .from(modsTable)
        .leftJoin(
          modContributorsTable,
          eq(modContributorsTable.modId, modsTable.id),
        )
        .leftJoin(
          githubUsersTable,
          eq(githubUsersTable.id, modContributorsTable.userId),
        )
        .leftJoin(modVersionsTable, eq(modVersionsTable.modId, modsTable.id))
        .leftJoin(
          modVersionSupportedGameVersionsTable,
          eq(
            modVersionSupportedGameVersionsTable.modVersionId,
            modVersionsTable.id,
          ),
        )
        .leftJoin(
          gameVersionsTable,
          eq(
            gameVersionsTable.id,
            modVersionSupportedGameVersionsTable.gameVersionId,
          ),
        )
        .where(
          and(
            eq(gameVersionsTable.version, gameVersion),
            // TODO improve search
            !!search
              ? sql`${search} % ANY(STRING_TO_ARRAY(${modsTable.name},' '))`
              : sql`TRUE`,
          ),
        )
        .groupBy(modsTable.id, githubUsersTable.id, gameVersionsTable.id)

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
        .insert(modContributorsTable)
        .values(input.userIds.map((userId) => ({ modId: input.modId, userId })))
    }),

  removeModContributor: modContributorProcedure
    .input(z.object({ modId: z.string(), userId: z.string() }))
    .mutation(async ({ input }) => {
      const contributorCount = await drizzleClient
        .select({ count: count(modContributorsTable) })
        .from(modContributorsTable)
        .where(eq(modContributorsTable.modId, input.modId))

      if (!contributorCount[0]?.count || contributorCount[0]?.count <= 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot remove last contributor",
        })
      }

      await drizzleClient
        .delete(modContributorsTable)
        .where(
          and(
            eq(modContributorsTable.modId, input.modId),
            eq(modContributorsTable.userId, input.userId),
          ),
        )
    }),

  versions: versionsRouter,
})

export default modsRouter
