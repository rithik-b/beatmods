"use client"

import { env } from "@beatmods/env"
import { createBrowserClient } from "@supabase/ssr"

const supabase = createBrowserClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <button onClick={async () => {
        await supabase.auth.signInWithOAuth({ provider: "github" })
      }}>Login</button>
    </main>
  )
}