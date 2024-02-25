import Contributors from "@beatmods/components/Contributors"
import { api } from "@beatmods/trpc/server"
import { getTRPCErrorFromUnknown } from "@trpc/server"
import Versions from "./_components/Versions"
import ContributorsEditor from "./_components/contributors-editor/ContributorsEditor"
import ModDetailsEditor from "./_components/details-editor/ModDetailsEditor"
import { ModDetailsProvider } from "./_hooks/useModDetails"

export default async function ModDetails({ params }: { params: { slug: string } }) {
  const { slug } = params
  try {
    const mod = await api.mods.modBySlug.query(slug)
    let isContributor = false

    try {
      const currentUser = await api.user.user.query()
      isContributor = mod.contributors.some((c) => c.id === currentUser?.id)
    } catch (e) {}

    return (
      <ModDetailsProvider mod={mod}>
        <div className="flex h-full flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center gap-2">
                <h1 className="text-6xl">{mod.name}</h1>
                <div className="flex h-fit min-w-16 justify-center rounded-full bg-primary p-2 text-sm text-primary-foreground">
                  {mod.category}
                </div>
              </div>
              {isContributor && <ModDetailsEditor />}
            </div>
            <div className="flex h-8 flex-row items-center gap-2">
              <Contributors contributors={mod.contributors} />
              {isContributor && (
                <ContributorsEditor modId={mod.id} modName={mod.name} contributors={mod.contributors} />
              )}
            </div>
            {mod.description ? (
              <p className="text-lg">{mod.description}</p>
            ) : (
              <p className="text-lg font-light italic">No description provided.</p>
            )}
          </div>
          <Versions modId={mod.id} isContributor={isContributor} />
        </div>
      </ModDetailsProvider>
    )
  } catch (e) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-2xl">{getTRPCErrorFromUnknown(e).message}</p>
      </div>
    )
  }
}
