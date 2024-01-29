import type GithubUser from "@beatmods/types/GithubUser"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@beatmods/components/ui/avatar"
import { cn, getShortUsernameForAvatar } from "@beatmods/utils"
import { getNameForGithubUser } from "@beatmods/types/GithubUser"

interface Props {
  githubUser: GithubUser
  className?: string
}

export default function GithubAvatar({ githubUser, className }: Props) {
  const name = getNameForGithubUser(githubUser)

  return (
    <Avatar className={className}>
      <AvatarImage src={githubUser.avatarUrl ?? undefined} alt={name} />
      <AvatarFallback>{getShortUsernameForAvatar(name)}</AvatarFallback>
    </Avatar>
  )
}
