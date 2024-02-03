"use client"

import { Button } from "@beatmods/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@beatmods/components/ui/dialog"
import { api } from "@beatmods/trpc/react"
import { Loader2, Plus } from "lucide-react"
import { Suspense, useState } from "react"
import UploadVersion from "../../_components/upload-version/UploadVersion"
import type NewVersionSchema from "@beatmods/types/NewVersionSchema"
import { type z } from "zod"
import { getTRPCErrorFromUnknown } from "@trpc/server"

interface Props {
  modId: string
}

export default function NewVersion({ modId }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const { mutateAsync: createNewModVersionAsync } =
    api.mods.versions.createNew.useMutation()
  const utils = api.useUtils()

  const onUploadSuccess = async (
    modVersion: z.infer<typeof NewVersionSchema>,
  ) => {
    try {
      await createNewModVersionAsync(modVersion)
      setIsOpen(false)
      void utils.mods.versions.getVersionsForMod.invalidate({ modId })
    } catch (e) {
      setError(getTRPCErrorFromUnknown(e).message)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button className="flex flex-row items-center gap-2">
          <Plus /> Add new version
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Version</DialogTitle>
          <DialogDescription>
            Upload a new version of your mod
          </DialogDescription>
          <DialogDescription className="text-destructive">
            {!!error && error}
          </DialogDescription>
        </DialogHeader>
        <Suspense
          fallback={
            <div className="flex w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          <UploadVersion
            modId={modId}
            onUploadSuccess={onUploadSuccess}
            onError={setError}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
