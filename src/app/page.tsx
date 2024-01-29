import { api } from "@beatmods/trpc/server"
import SignIn from "@beatmods/app/_components/SignIn"

export default async function Home() {
  try {
    await api.user.user.query()

    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="group flex flex-row items-end gap-2">
          <h1 className="text-4xl">Welcome back!</h1>
          <h3 className="text-2xl text-gray-500 opacity-0 transition-opacity duration-1000 group-hover:opacity-100">
            back from where?
          </h3>
        </div>
      </div>
    )
  } catch (e) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <SignIn />
      </div>
    )
  }
}
