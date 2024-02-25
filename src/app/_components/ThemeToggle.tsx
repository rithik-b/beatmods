"use client"

import { useTheme } from "next-themes"
import { Button } from "@beatmods/components/ui/button"
import { Laptop, Loader2, Moon, Sun } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@beatmods/components/ui/dropdown-menu"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="justify-start">
          <div className="flex w-8 items-center justify-center">
            {isMounted ? (
              theme === "system" ? (
                <Laptop className="h-4 w-4" />
              ) : theme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )
            ) : (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
          </div>
          Theme
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup className="flex flex-col gap-2" value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem className="flex flex-row gap-1" value="system">
            <Laptop className="h-4 w-4" />
            System
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex flex-row gap-1" value="dark">
            <Moon className="h-4 w-4" />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex flex-row gap-1" value="light">
            <Sun className="h-4 w-4" />
            Light
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
