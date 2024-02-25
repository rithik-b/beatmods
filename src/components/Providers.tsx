"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import NextAdapterApp from "next-query-params/app"
import { QueryParamProvider } from "use-query-params"
import { type PropsWithChildren } from "react"

export function Providers({ children }: PropsWithChildren) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryParamProvider adapter={NextAdapterApp}>{children}</QueryParamProvider>
    </NextThemesProvider>
  )
}
