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

interface Props {
  modId: string
}

export default function Versions({ modId }: Props) {
  const { data } = api.mods.getModVersions.useQuery({ modId })

  return (
    <div className="flex flex-col gap-5">
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
