"use client"

import { Button } from "@beatmods/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@beatmods/components/ui/dialog"
import type GithubUser from "@beatmods/types/GithubUser"
import { Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import RemoveContributors from "./RemoveContributors"
import AddContributors from "./AddContributors"

interface Props {
  modId: string
  modName: string
  contributors: GithubUser[]
}

export default function ContributorsEditor({
  modId,
  modName,
  contributors,
}: Props) {
  const router = useRouter()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contributors</DialogTitle>
          <DialogDescription>
            Modifiy the contributors for {modName}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <RemoveContributors
            modId={modId}
            contributors={contributors}
            onRemovalSuccess={() => {
              router.refresh()
            }}
          />
          <AddContributors
            modId={modId}
            contributors={contributors}
            onAddSuccess={() => {
              router.refresh()
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
