"use client"

import GithubAvatar from "@beatmods/components/GithubAvatar"
import { Button } from "@beatmods/components/ui/button"
import { CommandItem } from "@beatmods/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@beatmods/components/ui/dialog"
import TagInput from "@beatmods/components/ui/tag-input"
import { api } from "@beatmods/trpc/react"
import type GithubUser from "@beatmods/types/GithubUser"
import { getNameForGithubUser } from "@beatmods/types/GithubUser"
import { UserRoundPlus } from "lucide-react"
import { useState } from "react"

interface Props {
  modId: string
  contributors: GithubUser[]
  onAddSuccess: () => void
}

export default function AddContributors({
  modId,
  contributors,
  onAddSuccess,
}: Props) {
  const mutation = api.mods.addMultipleModContributors.useMutation()
  const { data } = api.allUsers.useQuery()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [inputValue, setInputValue] = useState("")

  if (!data) {
    return null
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setInputValue("")
        setSelectedUsers([])
        setIsOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button className="flex flex-row items-center gap-2">
          <UserRoundPlus />
          Add Contributors
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Contributors</DialogTitle>
        </DialogHeader>
        <div className="flex w-full flex-col gap-3">
          {/* TODO: Consider handling overflow if many contributors are selected */}
          <TagInput
            placeholder="Users"
            inputValue={inputValue}
            setInputValue={setInputValue}
            getLabel={(userId) => {
              return data.find((u) => u.id === userId)!.userName
            }}
            onChange={(value) => {
              setSelectedUsers(value)
            }}
            value={selectedUsers}
          >
            {data
              .filter((u) => {
                return (
                  !selectedUsers.includes(u.id) &&
                  !contributors.map((c) => c.id).includes(u.id)
                )
              })
              .map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.userName}
                  onSelect={() => {
                    setSelectedUsers(selectedUsers.concat(user.id))
                    setInputValue("")
                  }}
                >
                  <div className="flex flex-row items-center gap-x-2">
                    <GithubAvatar
                      githubUser={user}
                      className="h-6 w-6 text-xs"
                    />
                    <span className="text-sm">
                      {getNameForGithubUser(user)}
                    </span>
                  </div>
                </CommandItem>
              ))}
          </TagInput>
          <Button
            disabled={selectedUsers.length === 0}
            onClick={async () => {
              try {
                await mutation.mutateAsync({ modId, userIds: selectedUsers })
                setIsOpen(false)
                onAddSuccess()
              } catch (e) {
                console.log(e)
              }
            }}
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}