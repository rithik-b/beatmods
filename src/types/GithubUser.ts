import { type Database } from "@beatmods/types/supabase"

type GithubUser = Database["public"]["Tables"]["github_users"]["Row"]

export const getNameForGithubUser = (user: GithubUser) => {
  return user.name ?? user.user_name
}

export default GithubUser
