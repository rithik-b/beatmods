import { Command, CommandList } from "@beatmods/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"
import { type PropsWithChildren, useState } from "react"
import { cn } from "@beatmods/utils"
import { X } from "lucide-react"

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
  const [inputFocused, setInputFocused] = useState(false)

  return (
    <Command className="relative overflow-visible">
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border px-3",
          inputFocused ? "ring-2 ring-ring ring-offset-2" : "",
        )}
        cmdk-input-wrapper=""
      >
        {value.map((v) => (
          <div
            key={getLabel?.(v) ?? v}
            className="flex flex-row items-center gap-0.5 rounded-full bg-primary px-2 py-1 text-sm text-primary-foreground"
          >
            <div
              className="cursor-pointer"
              onClick={() => onChange(value.filter((x) => x !== v))}
            >
              <X
                strokeWidth={3}
                className="h-3 w-3 transition-all hover:text-gray-300"
              />
              <span className="sr-only">Remove</span>
            </div>
            <span>{getLabel?.(v) ?? v}</span>
          </div>
        ))}
        <CommandPrimitive.Input
          placeholder={!value || value.length === 0 ? placeholder : undefined}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          value={inputValue}
          onValueChange={setInputValue}
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          onKeyDown={(e) => {
            if (
              e.key === "Backspace" &&
              (e.target as HTMLInputElement).value === ""
            )
              onChange(value.slice(0, value.length - 1))
          }}
        />
      </div>
      {inputFocused && (value.length === 0 || inputValue !== "") && (
        <CommandList className="absolute top-[48px] z-10 w-full rounded-md border-b border-l border-r bg-card p-2">
          {children}
        </CommandList>
      )}
    </Command>
  )
}

export default TagInput
