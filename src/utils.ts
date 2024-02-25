import { createBrowserClient } from "@supabase/ssr"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { env } from "./env"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function getShortUsernameForAvatar(username: string): string {
  const parts = username.split(/[\s_-]+|(?=[A-Z])/)
  if (parts.length === 1) {
    return parts[0]!.substring(0, 2)
  }
  return parts
    .map((p) => p[0])
    .join("")
    .substring(0, 2)
}

export function getSupabaseBrowserClient() {
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export function diffObjects<T extends Record<string, unknown>>(a: T, b: T): Partial<T> {
  const diff: Partial<T> = {}
  for (const key in a) {
    if (a[key] !== b[key]) {
      diff[key] = b[key]
    }
  }
  return diff
}
