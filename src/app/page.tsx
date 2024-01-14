import { api } from "@beatmods/trpc/server"
import SignIn from "@beatmods/app/_components/SignIn"

export default async function Home() {
  try {
    await api.user.user.query()

    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-4xl">Welcome back!</h1>
      </main>
    )
  } catch (e) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <SignIn />
      </main>
    )
  }
}
