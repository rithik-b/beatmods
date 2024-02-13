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
import { and, count, eq, sql } from "drizzle-orm"
import versionsRouter, { createNewModVersion } from "./versions"
import NewVersionSchema from "@beatmods/types/NewVersionSchema"
import {
  modsTable,
  modContributorsTable,
  githubUsersTable,
} from "@beatmods/types/dbSchema"

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
            name: !!input.mod.name ? input.mod.name : input.mod.id,
            description: !input.mod.description ? null : input.mod.description,
            category: input.mod.category,
            moreInfoUrl: input.mod.moreInfoUrl,
            slug: createSlug(input.mod.id),
          })
          .returning({
            id: modsTable.id,
            slug: modsTable.slug,
          })
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

      const gameVersionId = !!gameVersion
        ? (
            await drizzleClient.query.gameVersionsTable.findFirst({
              columns: {
                id: true,
              },
              where: (gameVersions, { eq }) =>
                eq(gameVersions.version, gameVersion),
            })
          )?.id
        : null

      const mods = await drizzleClient.query.modsTable.findMany({
        columns: {
          id: true,
          name: true,
          slug: true,
          category: true,
        },
        with: {
          contributors: {
            columns: {},
            with: {
              user: true,
            },
          },
          versions: {
            orderBy: (versions, { desc }) => desc(versions.version),
            limit: 1,
            columns: { version: true },
            with: {
              supportedGameVersions: {
                columns: {
                  gameVersionId: true,
                },
                where: (supportedGameVersions, { eq }) =>
                  !!gameVersionId
                    ? eq(supportedGameVersions.gameVersionId, gameVersionId)
                    : sql`TRUE`,
              },
            },
          },
        },
        where: (mods) =>
          // TODO improve search
          !!search
            ? sql`${search} % ANY(STRING_TO_ARRAY(${mods.name},' '))`
            : sql`TRUE`,
      })

      return mods.map((mod) => {
        const { versions, contributors, ...rest } = mod
        return {
          ...rest,
          latestVersion: versions[0]?.version,
          contributors: contributors.map((contributor) => contributor.user),
        }
      })
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
