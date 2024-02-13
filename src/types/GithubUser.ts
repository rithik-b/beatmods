import { type InferSelectModel } from "drizzle-orm"
import { type githubUsersTable } from "./dbSchema"

type GithubUser = Omit<
  InferSelectModel<typeof githubUsersTable>,
  "createdAt" | "authId"
>

export const getNameForGithubUser = (user: GithubUser) => {
  return user.name ?? user.userName
}

export default GithubUser
