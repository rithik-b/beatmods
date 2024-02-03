import drizzleClient from "@beatmods/server/drizzleClient"
import supabaseServiceRoleClient from "@beatmods/server/supabaseServiceRoleClient"
import NewVersionSchema from "@beatmods/types/NewVersionSchema"
import {
  modVersionsTable,
  modVersionSupportedGameVersionsTable,
  gameVersionsTable,
  modVersionDependenciesTable,
  modsTable,
} from "@beatmods/types/drizzle"
import { TRPCError } from "@trpc/server"
import { eq, inArray, count, and, desc } from "drizzle-orm"
import { z } from "zod"
import {
  createTRPCRouter,
  modContributorProcedure,
  publicProcedure,
} from "../../trpc"

const versionsRouter = createTRPCRouter({
  getVersionsForMod: publicProcedure
    .input(z.object({ modId: z.string() }))
    .query(async ({ input }) => {
      const { modId } = input
      const modVersionsQuery = await drizzleClient
        .select({
          id: modVersionsTable.id,
          version: modVersionsTable.version,
          downloadUrl: modVersionsTable.downloadUrl,
          dependency: {
            id: modsTable.id,
            version: modVersionDependenciesTable.semver,
          },
          supportedGameVersion: gameVersionsTable.version,
        })
        .from(modVersionsTable)
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
        .leftJoin(
          modVersionDependenciesTable,
          eq(modVersionDependenciesTable.modVersionsId, modVersionsTable.id),
        )
        .leftJoin(
          modsTable,
          eq(modsTable.id, modVersionDependenciesTable.dependencyId),
        )
        .where(eq(modVersionsTable.modId, modId))
        .orderBy(desc(modVersionsTable.version))

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
  // TODO look for lowest version that supports all game versions
  getModsForGameVersions: publicProcedure
    .input(z.array(z.string()))
    .query(async ({ input }) => {
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
          eq(
            modVersionSupportedGameVersionsTable.modVersionId,
            modVersionsTable.id,
          ),
        )
        .where(
          inArray(modVersionSupportedGameVersionsTable.gameVersionId, input),
        )

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
  getUploadUrl: modContributorProcedure
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
          .select({ modCount: count(modsTable) })
          .from(modsTable)
          .where(eq(modsTable.id, modId))
          .limit(1)
      )?.[0]?.modCount

      if (modCount === 0)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Mod does not exist",
        })

      const modVersionCount = (
        await drizzleClient
          .select({ modVersionCount: count(modVersionsTable) })
          .from(modVersionsTable)
          .where(
            and(
              eq(modVersionsTable.modId, modId),
              eq(modVersionsTable.version, version),
            ),
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

      return await supabaseServiceRoleClient.storage
        .from("mods")
        .createSignedUploadUrl(`${modId}/${modId}_${version}.zip`)
    }),
  createNew: modContributorProcedure
    .input(NewVersionSchema)
    .mutation(async ({ input }) => {
      const { modId, version, supportedGameVersionIds, dependencies } = input

      const { data: downloadUrl } = supabaseServiceRoleClient.storage
        .from("mods")
        .getPublicUrl(`${modId}/${modId}_${version}.zip`)

      await drizzleClient.transaction(async (trx) => {
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
      })
    }),
})

export default versionsRouter
