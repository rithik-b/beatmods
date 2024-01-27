"use client"

import { Button } from "@beatmods/components/ui/button"
import SignIn from "./SignIn"
import GithubAvatar from "@beatmods/components/GithubAvatar"
import { getNameForGithubUser } from "@beatmods/types/GithubUser"
import { api } from "@beatmods/trpc/react"
import { Skeleton } from "@beatmods/components/ui/skeleton"

export default function UserButton() {
  const { data: user, isLoading } = api.user.user.useQuery()

  if (!!user)
    return (
      <Button variant="ghost" className="flex flex-row justify-start gap-2">
        <GithubAvatar size={8} githubUser={user} />
        <span className="text-md">{getNameForGithubUser(user)}</span>
      </Button>
    )

  if (isLoading) return <Skeleton className="h-8 w-full" />

  return <SignIn />
}
