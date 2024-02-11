import { type InferSelectModel } from "drizzle-orm"
import type dbSchema from "./dbSchema"

type GithubUser = Omit<
  InferSelectModel<typeof dbSchema.githubUsers>,
  "createdAt" | "authId"
>

export const getNameForGithubUser = (user: GithubUser) => {
  return user.name ?? user.userName
}

export default GithubUser
