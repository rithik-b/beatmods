import { type InferSelectModel } from "drizzle-orm"
import { type githubUsersTable } from "./drizzle"

type GithubUser = Omit<InferSelectModel<typeof githubUsersTable>, "createdAt">

export const getNameForGithubUser = (user: GithubUser) => {
  return user.name ?? user.userName
}

export default GithubUser
