"use client"

import Contributors from "@beatmods/components/Contributors"
import { DataTable } from "@beatmods/components/ui/data-table"
import { Skeleton } from "@beatmods/components/ui/skeleton"
import { api } from "@beatmods/trpc/react"
import { type Database } from "@beatmods/types/supabase"
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table"
import Link from "next/link"

type ModColumns =
  Database["public"]["Functions"]["get_mods_listing"]["Returns"][0]

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
    accessorKey: "latest_mod_version",
  },
]

export default function ModsTable() {
  const { data: mods, isLoading } = api.mods.getModsForListing.useQuery()

  if (isLoading)
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
  return <DataTable columns={columns} data={mods!} />
}
