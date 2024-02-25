import type GithubUser from "@beatmods/types/GithubUser"
import GithubAvatar from "@beatmods/components/GithubAvatar"
import { getNameForGithubUser } from "@beatmods/types/GithubUser"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card"
import { Separator } from "./ui/separator"

interface Props {
  contributors: GithubUser[]
}

export default function Contributors({ contributors }: Props) {
  if (contributors.length <= 2) {
    return (
      <div className="flex flex-row items-center gap-1">
        <div className="flex flex-row items-center gap-0.5">
          {contributors.map((c) => (
            <GithubAvatar githubUser={c} key={c.id} />
          ))}
        </div>
        <span className="text-md">{contributors.map((c) => getNameForGithubUser(c)).join(" & ")}</span>
      </div>
    )
  }

  const [first, ...rest] = contributors

  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger className="w-fit cursor-default transition-all duration-200 hover:scale-105 hover:font-medium">
        <div className="flex w-fit flex-row items-center gap-1">
          <div className="flex flex-row items-center gap-0.5">
            <GithubAvatar githubUser={first!} key={first!.id} />
            <Avatar className="h-8 w-8">
              <AvatarImage src={undefined} />
              <AvatarFallback>+{rest.length}</AvatarFallback>
            </Avatar>
          </div>
          <span className="text-md">
            {getNameForGithubUser(first!)} and {rest.length} others
          </span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="flex w-fit flex-col gap-2">
        <h2 className="text-md font-medium">Contributors</h2>
        <Separator />
        <div className="flex flex-col gap-1">
          {contributors.map((c) => (
            <div className="flex flex-row items-center gap-1" key={c.id}>
              <GithubAvatar githubUser={c} size="small" />
              <span className="text-sm">{getNameForGithubUser(c)}</span>
            </div>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
