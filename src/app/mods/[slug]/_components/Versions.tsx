import { api } from "@beatmods/trpc/server"
import UploadVersion from "./UploadVersion"

interface Props {
  modId: string
}

export default async function Versions({ modId }: Props) {
  const gameVersions = await api.gameVersions.query()
  return (
    <div>
      <h2 className="text-4xl">Versions</h2>
      <UploadVersion modId={modId} gameVersions={gameVersions} />
    </div>
  )
}
