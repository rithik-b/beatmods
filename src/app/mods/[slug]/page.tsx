import Contributors from "@beatmods/components/Contributors"
import { api } from "@beatmods/trpc/server"
import Versions from "./_components/Versions"
import { getTRPCErrorFromUnknown } from "@trpc/server"

export default async function ModDetails({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params
  try {
    const mod = await api.mods.modBySlug.query(slug)

    return (
        <h1 className="text-4xl">{mod.name}</h1>
      <div className="flex h-full flex-col gap-2 p-5">
        <Contributors contributors={mod.contributors} />
        <p>{mod.more_info_url}</p>
        {!!mod.description ? (
          <p>{mod.description}</p>
        ) : (
          <p className="font-light text-gray-400">No description.</p>
        )}
        <Versions modId={mod.id} />
      </div>
    )
  } catch (e) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p>{getTRPCErrorFromUnknown(e).message}</p>
      </div>
    )
  }
}
