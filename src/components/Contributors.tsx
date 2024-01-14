import type GithubUser from "@beatmods/types/GithubUser"
import GithubAvatar from "@beatmods/components/GithubAvatar"
import { getNameForGithubUser } from "@beatmods/types/GithubUser"

interface Props {
  contributors: GithubUser[]
}

function getContributorsString(contributors: GithubUser[]) {
  if (contributors.length <= 2) {
    return contributors.map((c) => getNameForGithubUser(c)).join(" & ")
  } else {
    const [first, ...rest] = contributors
    return `${getNameForGithubUser(first!)} and ${rest.length} others`
  }
}

export default function Contributors({ contributors }: Props) {
  return (
    <div className="flex flex-row items-center gap-1">
      <div className="flex flex-row items-center gap-0.5">
        {contributors.map((c) => (
          <GithubAvatar githubUser={c} size={8} key={c.id} />
        ))}
      </div>
      <span className="text-sm">{getContributorsString(contributors)}</span>
    </div>
  )
}
