import { api } from "@beatmods/trpc/server"
import SignIn from "@beatmods/app/_components/SignIn"

export default async function Home() {
  let loggedIn = false

  try {
    const user = await api.user.user.query()
    loggedIn = !!user
  } catch (error) {}

  if (loggedIn) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <h1 className="text-4xl">Welcome back!</h1>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <SignIn />
    </main>
  )
}
