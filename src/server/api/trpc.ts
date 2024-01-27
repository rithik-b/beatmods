/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { env } from "@beatmods/env"
import { type Database } from "@beatmods/types/supabase"
import { type CookieOptions, createServerClient } from "@supabase/ssr"
import { TRPCError, initTRPC } from "@trpc/server"
import { cookies } from "next/headers"
import superjson from "superjson"
import { ZodError, z } from "zod"

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (isSSR?: boolean) => {
  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          if (isSSR) return
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          if (isSSR) return
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          cookieStore.set({ name, value: "", ...options })
        },
      },
    },
  )
  return {
    supabase,
  }
}

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure

export const authenticatedProcedure = publicProcedure.use(async (opts) => {
  const { error, data } = await opts.ctx.supabase.rpc("get_current_user")
  // TODO better error handling
  if (!!error || !data?.[0])
    throw new TRPCError({
      code:
        error?.code === "invalid_token"
          ? "UNAUTHORIZED"
          : "INTERNAL_SERVER_ERROR",
      message: error?.message,
    })
  return opts.next({ ctx: { ...opts.ctx, user: data[0] } })
})

export const modContributorProcedure = authenticatedProcedure
  .input(z.object({ modId: z.string() }))
  .use(async (opts) => {
    const { count, error } = await opts.ctx.supabase
      .from("mod_contributors")
      .select("", { count: "exact", head: true })
      .eq("user_id", opts.ctx.user.id)
      .eq("mod_id", opts.input.modId)
      .single()

    // TODO better error handling
    if (!!error?.message)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      })

    if (!count)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not a contributor to this mod.",
      })

    return opts.next(opts)
  })
