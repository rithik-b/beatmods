import getIsLoggedIn from "@beatmods/server/getIsLoggedIn"
import ModsTable from "./_components/ModsTable"
import NewMod from "./_components/NewMod"

export default async function Mods() {
  const isLoggedIn = await getIsLoggedIn()

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="flex flex-row justify-between">
        <h1 className="text-4xl font-bold">Mods</h1>
        {isLoggedIn && <NewMod />}
      </div>
      <ModsTable />
    </div>
  )
}
