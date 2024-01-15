import Contributors from "@beatmods/components/Contributors"
import { api } from "@beatmods/trpc/server"

export default async function ModDetails({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params
  try {
    const mod = await api.mods.modBySlug.query(slug)

    return (
      <main className="flex flex-col p-5">
        <h1 className="text-4xl">{mod.name}</h1>
        <Contributors contributors={mod.contributors} />
        <p>{mod.more_info_url}</p>
        {!!mod.description ? (
          <p>{mod.description}</p>
        ) : (
          <p className="font-light text-gray-400">No description.</p>
        )}
      </main>
    )
  } catch (e) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <p>Mod not found.</p>
      </main>
    )
  }
}
