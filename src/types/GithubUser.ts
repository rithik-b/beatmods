import { type InferSelectModel } from "drizzle-orm"
import { type githubUsers } from "./autogen/drizzle"

type GithubUser = Omit<InferSelectModel<typeof githubUsers>, "createdAt">

export const getNameForGithubUser = (user: GithubUser) => {
  return user.name ?? user.userName
}

export default GithubUser
