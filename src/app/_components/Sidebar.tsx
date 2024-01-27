"use client"
import { Button } from "@beatmods/components/ui/button"
import { HomeIcon, ListIcon } from "lucide-react"
import UserButton from "./UserButton"
import { usePathname } from "next/navigation"
import Link from "next/link"

export default function Sidebar() {
  const pathName = usePathname()

  return (
    <div className="flex min-w-48 flex-col justify-between px-2 py-5">
      <div className="flex flex-col gap-2">
        <Button
          className="justify-start"
          variant={pathName === "/" ? "secondary" : "ghost"}
          asChild
        >
          <Link href="/" className="flex flex-row gap-2">
            <HomeIcon className="h-4 w-4" />
            Home
          </Link>
        </Button>
        <Button
          className="justify-start"
          variant={pathName.startsWith("/mods") ? "secondary" : "ghost"}
        >
          <Link href="/mods" className="flex flex-row justify-start gap-2">
            <ListIcon className="h-4 w-4" />
            Mods
          </Link>
        </Button>
      </div>
      <UserButton />
    </div>
  )
}
