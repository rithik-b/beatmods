import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { type NextRequest } from "next/server"

import { env } from "@beatmods/env"
import { appRouter } from "@beatmods/server/api/root"
import { createTRPCContext } from "@beatmods/server/api/trpc"

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext(),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`)
          }
        : undefined,
  })

export { handler as GET, handler as POST }
