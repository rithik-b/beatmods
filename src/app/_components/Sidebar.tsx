"use client"
import { Button } from "@beatmods/components/ui/button"
import { HomeIcon, ListIcon } from "lucide-react"
import UserButton from "./UserButton"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { type ReactNode } from "react"
import ThemeToggle from "./ThemeToggle"

function SidebarLink({
  href,
  children,
  isSelected,
}: {
  href: string
  children: ReactNode
  isSelected: boolean
}) {
  return (
    <Button
      className="justify-start"
      variant={isSelected ? "secondary" : "ghost"}
      asChild
    >
      <Link href={href} className="flex flex-row gap-2">
        {children}
      </Link>
    </Button>
  )
}

export default function Sidebar() {
  const pathName = usePathname()

  return (
    <div className="flex min-w-48 flex-col justify-between py-5 pl-2">
      <div className="flex flex-col gap-2">
        <SidebarLink href="/" isSelected={pathName === "/"}>
          <HomeIcon className="h-4 w-4" />
          Home
        </SidebarLink>
        <SidebarLink href="/mods" isSelected={pathName.startsWith("/mods")}>
          <ListIcon className="h-4 w-4" />
          Mods
        </SidebarLink>
      </div>
      <div className="flex flex-col gap-2">
        <ThemeToggle />
        <UserButton />
      </div>
    </div>
  )
}
