import Contributors from "@beatmods/components/Contributors"
import { api } from "@beatmods/trpc/server"
import { getTRPCErrorFromUnknown } from "@trpc/server"
import Versions from "./_components/Versions"

export default async function ModDetails({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params
  try {
    const mod = await api.mods.modBySlug.query(slug)
    const gameVersions = await api.gameVersions.query()

    return (
      <div className="flex h-full flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-2">
            <h1 className="text-6xl">{mod.name}</h1>
            <div className="flex h-fit min-w-16 justify-center rounded-full bg-primary p-2 text-sm text-primary-foreground">
              {mod.category}
            </div>
          </div>
          <Contributors contributors={mod.contributors} />
          {mod.description ? (
            <p className="text-lg">{mod.description}</p>
          ) : (
            <p className="text-lg font-light italic">
              No description provided.
            </p>
          )}
        </div>
        <Versions modId={mod.id} gameVersions={gameVersions} />
      </div>
    )
  } catch (e) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-2xl">{getTRPCErrorFromUnknown(e).message}</p>
      </div>
    )
  }
}
