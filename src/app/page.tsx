import { api } from "@beatmods/trpc/server"
import SignIn from "@beatmods/app/_components/SignIn"

export default async function Home() {
  try {
    await api.user.user.query()

    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="flex flex-row group">
          <h1 className="text-4xl">Welcome back!</h1>
          <h3 className="text-2xl ml-2 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"> back from where?</h3>
        </div>
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
