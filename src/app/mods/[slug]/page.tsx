import Contributors from "@beatmods/components/Contributors"
import { CardTitle } from "@beatmods/components/ui/card"
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
      <div className="flex h-full flex-col gap-2 p-5">
        <CardTitle className="text-6xl">{mod.name}</CardTitle>
        <Contributors contributors={mod.contributors} />
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
