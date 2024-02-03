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

  const refreshData = () => {
    router.refresh()
  }

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
            Modify the contributors for {modName}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <RemoveContributors
            modId={modId}
            contributors={contributors}
            onRemovalSuccess={refreshData}
          />
          <AddContributors
            modId={modId}
            contributors={contributors}
            onAddSuccess={refreshData}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
