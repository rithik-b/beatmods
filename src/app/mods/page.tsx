import ModsTable from "./_components/ModsTable"
import NewMod from "./_components/new-mod/NewMod"

export default async function Mods() {
  return (
    <div className="flex h-full flex-col gap-5">
      <div className="flex flex-row justify-between">
        <h1 className="text-4xl font-bold">Mods</h1>
        <NewMod />
      </div>
      <ModsTable />
    </div>
  )
}
