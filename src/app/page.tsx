import SignIn from "@beatmods/app/_components/SignIn"
import getIsLoggedIn from "@beatmods/server/getIsLoggedIn"

export default async function Home() {
  const isLoggedIn = await getIsLoggedIn()

  return (
    <div className="flex h-full flex-col items-center justify-center">
      {isLoggedIn ? (
        <div className="group flex flex-row items-end gap-2">
          <h1 className="text-4xl">Welcome back!</h1>
          <h3 className="text-2xl text-gray-500 opacity-0 transition-opacity duration-1000 group-hover:opacity-100">
            back from where?
          </h3>
        </div>
      ) : (
        <SignIn />
      )}
    </div>
  )
}
