"use client"

import type modsRouter from "@beatmods/server/api/routers/mods"
import { type inferRouterOutputs } from "@trpc/server"
import { createContext, useContext } from "react"

type ModDetails = inferRouterOutputs<typeof modsRouter>["modBySlug"]

const ModDetailsContext = createContext<ModDetails | undefined>(undefined)

export function ModDetailsProvider({ children, mod }: { children: React.ReactNode; mod: ModDetails }) {
  return <ModDetailsContext.Provider value={mod}>{children}</ModDetailsContext.Provider>
}

export default function useModDetails() {
  return useContext(ModDetailsContext)
}
