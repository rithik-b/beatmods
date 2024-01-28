import { type Database } from "@beatmods/types/supabase"

type GithubUser = Omit<
  Database["public"]["Tables"]["github_users"]["Row"],
  "created_at"
>

export const getNameForGithubUser = (user: GithubUser) => {
  return user.name ?? user.user_name
}

export default GithubUser
