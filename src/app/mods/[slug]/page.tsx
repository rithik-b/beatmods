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
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-4xl">{mod.name}</h1>
        <p>{mod.more_info_url}</p>
        <p>{mod.contributors[0]!.name}</p>
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
