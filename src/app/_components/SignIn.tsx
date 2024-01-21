"use client"

import { Button } from "@beatmods/components/ui/button"
import { SiGithub } from "@icons-pack/react-simple-icons"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@beatmods/utils"

const supabase = getSupabaseBrowserClient()

export default function SignIn() {
  const router = useRouter()

  useEffect(
    () => {
      supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN") {
          router.push("/")
        }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <Button
      onClick={async () => {
        await supabase.auth.signInWithOAuth({ provider: "github" })
      }}
      className="items-center gap-2"
    >
      <SiGithub />
      Login
    </Button>
  )
}
