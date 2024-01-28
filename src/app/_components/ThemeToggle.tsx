"use client"

import { useTheme } from "next-themes"
import { Button } from "@beatmods/components/ui/button"
import { Laptop, Loader2, Moon, Sun } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@beatmods/components/ui/dropdown-menu"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="justify-start">
          <div className="flex w-8 items-center justify-center">
            {(() => {
              switch (theme) {
                case "dark":
                  return <Moon className="h-4 w-4" />
                case "light":
                  return <Sun className="h-4 w-4" />
                case "system":
                  return <Laptop className="h-4 w-4" />
                default:
                  return <Loader2 className="h-4 w-4 animate-spin" />
              }
            })()}
          </div>
          Theme
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex flex-col gap-2 rounded-md border">
        <DropdownMenuItem
          className="flex flex-row gap-1"
          onClick={() => setTheme("system")}
        >
          <Laptop className="h-4 w-4" />
          System
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex flex-row gap-1"
          onClick={() => setTheme("dark")}
        >
          <Moon className="h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex flex-row gap-1"
          onClick={() => setTheme("light")}
        >
          <Sun className="h-4 w-4" />
          Light
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
