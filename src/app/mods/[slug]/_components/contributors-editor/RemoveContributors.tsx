import GithubAvatar from "@beatmods/components/GithubAvatar"
import type GithubUser from "@beatmods/types/GithubUser"
import { getNameForGithubUser } from "@beatmods/types/GithubUser"
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
import { Button } from "@beatmods/components/ui/button"
import { Trash2 } from "lucide-react"
import { useMemo } from "react"

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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 rounded-md border px-3 py-2">
        {contributors.map((c) => (
          <div className="flex flex-row justify-between" key={c.id}>
            <div className="flex flex-row items-center gap-x-2">
              <GithubAvatar githubUser={c} />
              <span className="text-md">{getNameForGithubUser(c)}</span>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild disabled={isSingleContributor}>
                {!isSingleContributor && (
                  <Button
                    variant="destructive"
                    title="Remove contributor"
                    className="flex flex-row items-center gap-2"
                    size="icon"
                  >
                    <Trash2 />
                  </Button>
                )}
              </AlertDialogTrigger>
              <AlertDialogContent>
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
                    asChild
                    onClick={async () => {
                      try {
                        await mutateAsync({ modId, userId: c.id })
                        onRemovalSuccess()
                      } catch (e) {
                        console.log(e)
                      }
                    }}
                  >
                    <Button variant="destructive">Remove</Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  )
}
