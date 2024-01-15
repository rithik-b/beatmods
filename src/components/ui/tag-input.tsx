import {
  Command,
  CommandInput,
  CommandList,
} from "@beatmods/components/ui/command"
import { type PropsWithChildren, useState } from "react"
import { Cross2Icon } from "@radix-ui/react-icons"

interface BaseProps<T> {
  value: T[]
  onChange: (value: T[]) => void
  getLabel?: (value: T) => string
  placeholder?: string
  inputValue?: string
  setInputValue?: (value: string) => void
}

interface GenericProps<T> extends BaseProps<T> {
  getLabel: (value: T) => string
}

type Props<T> = T extends string ? BaseProps<T> : GenericProps<T>

const TagInput = <T,>({
  children,
  value,
  onChange,
  getLabel,
  placeholder,
  inputValue,
  setInputValue,
}: PropsWithChildren<Props<T>>) => {
  const [popoverOpen, setPopoverOpen] = useState(false)

  return (
    <Command className="relative overflow-visible">
      <CommandInput
        placeholder={!value || value.length === 0 ? placeholder : undefined}
        onFocus={() => setPopoverOpen(true)}
        onBlur={() => setPopoverOpen(false)}
        value={inputValue}
        onValueChange={setInputValue}
        onKeyDown={(e) => {
          if (
            e.key === "Backspace" &&
            (e.target as HTMLInputElement).value === ""
          )
            onChange(value.slice(0, value.length - 1))
        }}
        preInputChildren={
          <>
            {value.map((v) => (
              <div
                key={getLabel?.(v) ?? v}
                className="flex flex-row items-center gap-0.5 rounded-full bg-primary px-2 py-1 text-sm text-primary-foreground"
                onClick={() => onChange(value.filter((x) => x !== v))}
              >
                <Cross2Icon className="h-3 w-3 transition-all hover:text-gray-300" />
                <span>{getLabel?.(v) ?? v}</span>
              </div>
            ))}
          </>
        }
      />
      {popoverOpen && (
        <CommandList className="absolute top-[50px] z-10 w-full bg-card px-2 pb-2">
          {children}
        </CommandList>
      )}
    </Command>
  )
}

export default TagInput
