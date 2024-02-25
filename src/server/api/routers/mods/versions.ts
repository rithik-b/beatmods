import drizzleClient from "@beatmods/server/drizzleClient"
import supabaseServiceRoleClient from "@beatmods/server/supabaseServiceRoleClient"
import NewVersionSchema from "@beatmods/types/NewVersionSchema"
import { TRPCError } from "@trpc/server"
import { eq, inArray, count, and } from "drizzle-orm"
import { z } from "zod"
import { createTRPCRouter, modContributorProcedure, publicProcedure } from "../../trpc"
import {
  modVersionsTable,
  modVersionSupportedGameVersionsTable,
  modVersionDependenciesTable,
  gameVersionsTable,
} from "@beatmods/types/dbSchema"

export async function createNewModVersion(
  input: z.infer<typeof NewVersionSchema>,
  trx: Parameters<Parameters<typeof drizzleClient.transaction>[0]>[0],
) {
  const { modId, version, supportedGameVersionIds, dependencies } = input

  const { data: downloadUrl } = supabaseServiceRoleClient.storage
    .from("mods")
    .getPublicUrl(`${modId}/${modId}_${version}.zip`)

  const modVersionId = (
    await trx
      .insert(modVersionsTable)
      .values({
        modId,
        version,
        downloadUrl: downloadUrl.publicUrl,
      })
      .returning({ id: modVersionsTable.id })
  )[0]!.id

  await trx.insert(modVersionSupportedGameVersionsTable).values(
    supportedGameVersionIds.map((gameVersionId) => ({
      modVersionId,
      gameVersionId,
    })),
  )

  if (dependencies.length !== 0) {
    await trx.insert(modVersionDependenciesTable).values(
      dependencies.map((dependency) => ({
        modVersionsId: modVersionId,
        dependencyId: dependency.id,
        semver: dependency.version,
      })),
    )
  }
}

const versionsRouter = createTRPCRouter({
  getVersionsForMod: publicProcedure.input(z.object({ modId: z.string() })).query(async ({ input }) => {
    const { modId } = input
    const modVersions = await drizzleClient.query.modVersionsTable.findMany({
      columns: {
        id: true,
        version: true,
        downloadUrl: true,
      },
      with: {
        dependencies: {
          columns: { semver: true },
          with: {
            dependency: {
              columns: { id: true },
            },
          },
        },
        supportedGameVersions: {
          columns: {},
          with: {
            gameVersion: true,
          },
        },
      },
      where: (modVersions, { eq }) => eq(modVersions.modId, modId),
      orderBy: (modVersions, { desc }) => desc(modVersions.version),
    })

    return modVersions.map((modVersion) => {
      const { dependencies, supportedGameVersions, ...rest } = modVersion
      return {
        ...rest,
        dependencies: dependencies.map(({ semver, dependency }) => ({
          version: semver,
          id: dependency.id,
        })),
        supportedGameVersions: supportedGameVersions.map(({ gameVersion }) => gameVersion?.version),
      }
    })
  }),
  // TODO look for lowest version that supports all game versions
  getModsForGameVersions: publicProcedure.input(z.array(z.string())).query(async ({ input }) => {
    const data = await drizzleClient
      .select({
        modVersion: {
          modId: modVersionsTable.modId,
          version: modVersionsTable.version,
          gameVersionId: modVersionSupportedGameVersionsTable.gameVersionId,
        },
      })
      .from(modVersionsTable)
      .leftJoin(
        modVersionSupportedGameVersionsTable,
        eq(modVersionSupportedGameVersionsTable.modVersionId, modVersionsTable.id),
      )
      .where(inArray(modVersionSupportedGameVersionsTable.gameVersionId, input))

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
  getUploadUrl: modContributorProcedure.input(NewVersionSchema).mutation(async ({ input }) => {
    const { modId, version } = input

    // Need to do the following validations
    // - Mod version doesn't already exist
    // - Game version exists
    // - TODO Dependencies exist for the current game version

    const modVersionCount = (
      await drizzleClient
        .select({ modVersionCount: count(modVersionsTable) })
        .from(modVersionsTable)
        .where(and(eq(modVersionsTable.modId, modId), eq(modVersionsTable.version, version)))
        .limit(1)
    )?.[0]?.modVersionCount

    if (modVersionCount !== 0)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Mod version already exists",
      })

    const gameVersionCount = (
      await drizzleClient
        .select({ gameVersionCount: count(gameVersionsTable) })
        .from(gameVersionsTable)
        .where(eq(gameVersionsTable.id, input.supportedGameVersionIds[0]))
        .limit(1)
    )?.[0]?.gameVersionCount

    if (gameVersionCount === 0)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Game version does not exist",
      })

    await supabaseServiceRoleClient.storage.from("mods").remove([`${modId}/${modId}_${version}.zip`])

    return await supabaseServiceRoleClient.storage
      .from("mods")
      .createSignedUploadUrl(`${modId}/${modId}_${version}.zip`)
  }),
  createNew: modContributorProcedure.input(NewVersionSchema).mutation(async ({ input }) => {
    await drizzleClient.transaction(async (trx) => {
      await createNewModVersion(input, trx)
    })
  }),
})

export default versionsRouter
