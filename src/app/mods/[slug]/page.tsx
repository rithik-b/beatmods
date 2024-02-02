import Contributors from "@beatmods/components/Contributors"
import { api } from "@beatmods/trpc/server"
import { getTRPCErrorFromUnknown } from "@trpc/server"
import Versions from "./_components/Versions"
import ContributorsEditor from "./_components/contributors-editor/ContributorsEditor"

export default async function ModDetails({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params
  try {
    const mod = await api.mods.modBySlug.query(slug)
    const currentUser = await api.user.user.query()
    const isContributor = mod.contributors.some((c) => c.id === currentUser?.id)
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
          <div className="flex h-8 flex-row items-center gap-2">
            <Contributors contributors={mod.contributors} />
            {isContributor && (
              <ContributorsEditor
                modId={mod.id}
                modName={mod.name}
                contributors={mod.contributors}
              />
            )}
          </div>
          {mod.description ? (
            <p className="text-lg">{mod.description}</p>
          ) : (
            <p className="text-lg font-light italic">
              No description provided.
            </p>
          )}
        </div>
        <Versions
          modId={mod.id}
          gameVersions={gameVersions}
          isContributor={isContributor}
        />
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
