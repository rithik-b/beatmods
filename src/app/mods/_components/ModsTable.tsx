"use client"

import Contributors from "@beatmods/components/Contributors"
import { DataTable } from "@beatmods/components/ui/data-table"
import { Input } from "@beatmods/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@beatmods/components/ui/select"
import { Skeleton } from "@beatmods/components/ui/skeleton"
import type modsRouter from "@beatmods/server/api/routers/mods"
import { api } from "@beatmods/trpc/react"
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { type inferRouterOutputs } from "@trpc/server"
import Link from "next/link"
import { useEffect, useState } from "react"
import { StringParam, useQueryParam, withDefault } from "use-query-params"
import { useDebounce } from "usehooks-ts"

type ModColumns = inferRouterOutputs<typeof modsRouter>["getModsForListing"][0]
const columnHelper = createColumnHelper<ModColumns>()

const columns: ColumnDef<ModColumns>[] = [
  columnHelper.display({
    header: "Name",
    cell: (props) => {
      if (props.row.original.id === props.row.original.name)
        return (
          <Link
            href={`/mods/${props.row.original.slug}`}
            className="font-medium hover:underline"
          >
            {props.row.original.id}
          </Link>
        )
      return (
        <div className="flex flex-col">
          <span className="font-medium">{props.row.original.name}</span>
          <span className="text-xs font-light">{props.row.original.id}</span>
        </div>
      )
    },
  }),
  columnHelper.display({
    header: "Contributors",
    cell: (props) => {
      return <Contributors contributors={props.row.original.contributors} />
    },
  }),
  {
    header: "Category",
    accessorKey: "category",
  },
  {
    header: "Latest Version",
    accessorKey: "latestVersion",
  },
]

export default function ModsTable() {
  const { data: gameVersions } = api.gameVersions.useQuery()
  const [gameVersion, setGameVersion] = useQueryParam(
    "gameVersion",
    withDefault(StringParam, gameVersions?.[0]?.version),
  )
  const [searchQuery, setSearchQuery] = useQueryParam(
    "search",
    withDefault(StringParam, ""),
  )
  const [search, setSearch] = useState(searchQuery)
  const debouncedSearch = useDebounce(search, 500)
  const { data: mods } = api.mods.getModsForListing.useQuery(
    {
      gameVersion: gameVersion!,
      search: debouncedSearch,
    },
    {
      enabled: !!gameVersion,
      keepPreviousData: true,
    },
  )

  useEffect(() => {
    setSearchQuery(!!debouncedSearch ? debouncedSearch : undefined)
  }, [debouncedSearch, setSearchQuery])

  if (!mods)
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
    )

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row gap-5">
        <Select value={gameVersion} onValueChange={setGameVersion}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Game Version" />
          </SelectTrigger>
          <SelectContent>
            {gameVersions?.map((version) => (
              <SelectItem key={version.id} value={version.version}>
                {version.version}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
        />
      </div>
      <DataTable columns={columns} data={mods} />
    </div>
  )
}
