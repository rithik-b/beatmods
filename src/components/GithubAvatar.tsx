import type GithubUser from "@beatmods/types/GithubUser"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@beatmods/components/ui/avatar"
import { cn, getShortUsernameForAvatar } from "@beatmods/utils"
import { getNameForGithubUser } from "@beatmods/types/GithubUser"
import { cva } from "class-variance-authority"

const variants = cva("", {
  variants: {
    size: {
      small: "h-6 w-6 text-xs",
      default: "h-8 w-8",
    },
  },
  defaultVariants: { size: "default" },
})

interface BaseProps {
  githubUser: GithubUser
  className?: string
}

type Props = BaseProps & Parameters<typeof variants>[0]

export default function GithubAvatar({ githubUser, className, size }: Props) {
  const name = getNameForGithubUser(githubUser)

  return (
    <Avatar className={cn(variants({ size }), className)}>
      <AvatarImage src={githubUser.avatarUrl ?? undefined} alt={name} />
      <AvatarFallback>{getShortUsernameForAvatar(name)}</AvatarFallback>
    </Avatar>
  )
}
