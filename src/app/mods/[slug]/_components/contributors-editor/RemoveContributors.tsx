import GithubAvatar from "@beatmods/components/GithubAvatar"
import type GithubUser from "@beatmods/types/GithubUser"
import { getNameForGithubUser } from "@beatmods/types/GithubUser"
import { api } from "@beatmods/trpc/react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@beatmods/components/ui/alert-dialog"
import { Button } from "@beatmods/components/ui/button"
import { Trash2 } from "lucide-react"
import { useMemo, useRef, useState } from "react"

interface RemoveContributorsProps {
  modId: string
  contributors: GithubUser[]
  onRemovalSuccess: () => void
}

export default function RemoveContributors({
  modId,
  contributors,
  onRemovalSuccess,
}: RemoveContributorsProps) {
  const { mutateAsync } = api.mods.removeModContributor.useMutation()
  const isSingleContributor = useMemo(
    () => contributors.length === 1,
    [contributors],
  )
  function CloseCleanup() {
    clearTimeout(timerRef.current)
    setSelectedUser(null)
    setIsDisabled(false)
    setIsLoading(false)
    setIsOpen(false)
  }

  const [selectedUser, setSelectedUser] = useState<GithubUser | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)
  const currentUser = api.user.user.useQuery()
  const timerRef = useRef<NodeJS.Timeout>()

  const startTimer = () => {
    setIsDisabled(true)
    timerRef.current = setTimeout(() => {
      setIsDisabled(false)
    }, 3000)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 rounded-md border px-3 py-2">
        {contributors.map((c) => (
          <div className="flex flex-row justify-between" key={c.id}>
            <div className="flex flex-row items-center gap-x-2">
              <GithubAvatar githubUser={c} />
              <span className="text-md">{getNameForGithubUser(c)}</span>
            </div>
            {!isSingleContributor && (
              <Button
                variant="destructive"
                title="Remove contributor"
                size="icon"
                onClick={() => {
                  setSelectedUser(c)
                  if (c.id === currentUser.data!.id) {
                    startTimer()
                  }

                  setIsOpen(true)
                }}
              >
                <Trash2 />
              </Button>
            )}
          </div>
        ))}
        {selectedUser === null ? (
          ""
        ) : (
          <AlertDialog
            open={isOpen}
            onOpenChange={() => {
              // Only called if the dialog is closed via the cancel button
              CloseCleanup()
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>Remove Contributor?</AlertDialogHeader>
              <AlertDialogDescription>
                {`Are you sure you want to remove ${getNameForGithubUser(
                  selectedUser,
                )} from the contributors?`}
                <br />
                {currentUser.data?.id === selectedUser.id ? (
                  <span className="text-destructive">
                    You will lose access to this mod and won&apos;t be able to
                    add yourself back!
                  </span>
                ) : (
                  "They can be added back afterwards"
                )}
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  variant="destructive"
                  isLoading={isLoading}
                  disabled={isDisabled}
                  onClick={async () => {
                    try {
                      setIsLoading(true)
                      await mutateAsync({ modId, userId: selectedUser.id })
                      CloseCleanup()
                      onRemovalSuccess()
                    } catch (e) {
                      console.log(e)
                    }
                  }}
                >
                  Remove
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}
