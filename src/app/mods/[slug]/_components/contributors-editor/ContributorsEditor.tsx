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
import { useState } from "react"
import { useRouter } from "next/navigation"
import RemoveContributors from "./RemoveContributors"

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
  const [isOpen, setIsOpen] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const router = useRouter()

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
        </div>
      </DialogContent>
    </Dialog>
  )
}
