import Contributors from "@beatmods/components/Contributors"
import { api } from "@beatmods/trpc/server"
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
      <div className="flex flex-col gap-2 p-5">
        <div className="flex flex-row items-center gap-2">
          <h1 className="text-6xl">{mod.name}</h1>
          <div className=" h-fit rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
            {mod.category}
          </div>
        </div>
        <Contributors contributors={mod.contributors} />
        {mod.description ? (
          <p className="text-lg">{mod.description}</p>
        ) : (
          <p className="text-lg font-light italic">No description provided.</p>
        )}
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
