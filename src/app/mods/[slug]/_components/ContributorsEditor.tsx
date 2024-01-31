"use client"

import GithubAvatar from "@beatmods/components/GithubAvatar"
import { Button } from "@beatmods/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@beatmods/components/ui/dialog"
import { ScrollArea } from "@beatmods/components/ui/scroll-area"
import type GithubUser from "@beatmods/types/GithubUser"
import { getNameForGithubUser } from "@beatmods/types/GithubUser"
import { Pencil, Trash2 } from "lucide-react"
import { api } from "@beatmods/trpc/react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@beatmods/components/ui/alert-dialog"
import { useState } from "react"

interface RemoveModContributorProps {
  modId: string
  contributors: GithubUser[]
  onRemovalSuccess: () => void
  onCloseAutoFocus: () => void
}

function RemoveModContributor({
  modId,
  contributors,
  onRemovalSuccess,
  onCloseAutoFocus,
}: RemoveModContributorProps) {
  const mutation = api.mods.removeModContributor.useMutation()
  return (
    <div>
      <h1 className="text-2xl font-medium">Contributors</h1>
      {contributors.map((c) => (
        <div className="flex flex-row justify-between" key={c.id}>
          <div className="flex flex-row gap-1">
            <GithubAvatar githubUser={c} className="h-6 w-6 text-xs" />
            <span className="text-sm">{getNameForGithubUser(c)}</span>
          </div>
          <AlertDialog>
            <AlertDialogTrigger>
              <Button
                variant="destructive"
                className="flex flex-row items-center gap-2"
              >
                <Trash2 /> Remove
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onCloseAutoFocus={onCloseAutoFocus}>
              <AlertDialogHeader>Remove Contributor?</AlertDialogHeader>
              <AlertDialogDescription>
                {`Are you sure you want to remove ${getNameForGithubUser(
                  c,
                )} from the contributors?`}
                <br />
                {"They can be added back afterwards"}
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    try {
                      mutation.mutate({ modId, userId: c.id })
                      onRemovalSuccess()
                    } catch (e) {
                      console.log(e)
                    }
                  }}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}
    </div>
  )
}

interface Props {
  modId: string
  contributors: GithubUser[]
}

export default function ContributorsEditor({ modId, contributors }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const utils = api.useUtils()

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) setModalVisible(true)
        setIsOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col gap-1">
          {modalVisible && (
            <RemoveModContributor
              modId={modId}
              contributors={contributors}
              onRemovalSuccess={() => {
                setIsOpen(false)
                void utils.mods.getModVersions.invalidate({ modId })
              }}
              onCloseAutoFocus={() => {
                setModalVisible(false)
              }}
            />
          )}
          <h1 className="text-2xl font-medium">Add Contributor</h1>
          <ScrollArea></ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
