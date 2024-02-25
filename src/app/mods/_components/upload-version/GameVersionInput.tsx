import { useState, type ComponentProps } from "react"
import TagInput from "@beatmods/components/ui/tag-input"
import type GameVersion from "@beatmods/types/GameVersion"
import { CommandItem } from "@beatmods/components/ui/command"
import { useFormField } from "@beatmods/components/ui/form"

type Props = Omit<
  ComponentProps<typeof TagInput<string>>,
  "placeholder" | "inputValue" | "setInputValue" | "getLabel" | "hasError" | "children"
> & {
  allGameVersions: GameVersion[]
}

export default function GameVersionInput(props: Props) {
  const { allGameVersions, ...rest } = props
  const [inputValue, setInputValue] = useState("")
  const { error } = useFormField()

  return (
    <TagInput
      placeholder="Game Versions"
      inputValue={inputValue}
      setInputValue={setInputValue}
      getLabel={(gameVersionId) => allGameVersions.find((v) => v.id === gameVersionId)!.version}
      hasError={!!error}
      {...rest}
    >
      {allGameVersions
        .filter((v) => !rest.value.includes(v.id))
        .map((gameVersion) => (
          <CommandItem
            key={gameVersion.id}
            value={gameVersion.version}
            onSelect={() => {
              const newGameVersions = [...rest.value, gameVersion.id]
              rest.onChange(newGameVersions)
              setInputValue("")
            }}
          >
            {gameVersion.version}
          </CommandItem>
        ))}
    </TagInput>
  )
}
