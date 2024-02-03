"use client"
import { Button } from "@beatmods/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@beatmods/components/ui/card"
import { api } from "@beatmods/trpc/react"
import { Download } from "lucide-react"
import UploadVersion from "./upload-version/UploadVersion"
import type GameVersion from "@beatmods/types/GameVersion"

interface Props {
  modId: string
  gameVersions: GameVersion[]
  isContributor: boolean
}

export default function Versions({
  modId,
  gameVersions,
  isContributor,
}: Props) {
  const { data } = api.mods.versions.getVersionsForMod.useQuery({ modId })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-4xl">Versions</h2>
        {isContributor && (
          <UploadVersion modId={modId} gameVersions={gameVersions} />
        )}
      </div>
      {!!data &&
        data.map((version) => (
          <Card key={version.id}>
            <CardHeader>
              <CardTitle>{version.version}</CardTitle>
              <CardDescription className="flex flex-row items-center gap-2">
                For Beat Saber
                <span className="flex flex-row gap-1">
                  {version.supportedGameVersions.map((v) => (
                    <span
                      key={v}
                      className="rounded-full bg-primary px-2 py-1 text-sm text-primary-foreground"
                    >
                      {v}
                    </span>
                  ))}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {version.dependencies.length > 0 ? (
                <>
                  Dependencies:{" "}
                  {version.dependencies
                    .map((d) => `${d.id} ${d.version}`)
                    .join(", ")}
                </>
              ) : (
                <span className="text-muted-foreground">No dependencies</span>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild>
                <a
                  className="flex flex-row items-center gap-2"
                  href={version.downloadUrl}
                >
                  <Download /> Download
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
    </div>
  )
}
