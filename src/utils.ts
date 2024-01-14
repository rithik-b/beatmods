import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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
