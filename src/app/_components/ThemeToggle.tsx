"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@beatmods/components/ui/button"
import { Laptop, Moon, Sun } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@beatmods/components/ui/dropdown-menu"
import { Skeleton } from "@beatmods/components/ui/skeleton"

export default function ThemeToggle() {
    const [ mounted, setMounted ] = useState(false)
    const { theme, setTheme } = useTheme()
    
    useEffect(() => setMounted(true), [])

    if (!mounted) return (
        <div className="pl-4 pb-4">
            <Skeleton className="h-4 w-20 rounded-md"/>
        </div>
    )

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="justify-start gap-2">
                {(() => {
                    switch (theme) {
                        case "system":
                            return <Laptop className="h-4 w-4" />;
                        case "dark":
                            return <Moon className="h-4 w-4" />;
                        case "light":
                            return <Sun className="h-4 w-4" />;
                        }
                    })()}
                    Theme
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col gap-2 border rounded-md">
                <DropdownMenuItem className="flex flex-row gap-1" onClick={() => setTheme("system")}>
                    <Laptop className="h-4 w-4" />
                    System
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-row gap-1" onClick={() => setTheme("dark")}>
                    <Moon className="h-4 w-4" />
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-row gap-1" onClick={() => setTheme("light")}>
                    <Sun className="h-4 w-4" />
                    Light
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}