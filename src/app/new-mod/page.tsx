import NewModForm from "@beatmods/app/new-mod/_components/NewModForm"
import { api } from "@beatmods/trpc/server"

export default async function NewMod() {
  let isLogged = false
  try {
    const user = await api.user.user.query()
    isLogged = !!user
  } catch (e) {}

  const categories = await api.categories.query()

  return (
    <main className="p-5">
      {isLogged ? (
        <NewModForm categories={categories} />
      ) : (
        <p>You must be signed in to create a new mod.</p>
      )}
    </main>
  )
}
