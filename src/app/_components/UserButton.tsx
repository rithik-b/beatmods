"use client"

import { Button } from "@beatmods/components/ui/button"
import SignIn from "./SignIn"
import GithubAvatar from "@beatmods/components/GithubAvatar"
import { getNameForGithubUser } from "@beatmods/types/GithubUser"
import { api } from "@beatmods/trpc/react"
import { Skeleton } from "@beatmods/components/ui/skeleton"
import { getSupabaseBrowserClient } from "@beatmods/utils"
import { useEffect, useState } from "react"

const supabase = getSupabaseBrowserClient()

export default function UserButton() {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [checkedSession, setCheckedSession] = useState(false)
  const { data: user, isLoading } = api.user.user.useQuery(undefined, {
    enabled: isSignedIn,
  })

  useEffect(
    () => {
      supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN") {
          setIsSignedIn(true)
        }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => {
    async function checkSession() {
      const session = await supabase.auth.getSession()
      if (!!session.data.session) setIsSignedIn(true)
      setCheckedSession(true)
    }

    void checkSession()
  }, [])

  if ((isLoading && isSignedIn) || !checkedSession)
    return (
      <div className="flex flex-row items-center justify-start gap-2 pl-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-20 rounded-md" />
      </div>
    )

  if (!user) return <SignIn />

  return (
    <Button variant="ghost" className="flex flex-row justify-start gap-2">
      <GithubAvatar githubUser={user} className="h-8 w-8" />
      <span className="text-md">{getNameForGithubUser(user)}</span>
    </Button>
  )
}
