import ModsTable from "./_components/ModsTable"

export default async function Mods() {
  return (
    <div className="flex h-full flex-col gap-5">
      <h1 className="text-4xl font-bold">Mods</h1>
      <ModsTable />
    </div>
  )
}
