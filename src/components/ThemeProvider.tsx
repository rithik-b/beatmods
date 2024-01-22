"use client"

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { useEffect } from "react"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    // Dont know why, have to do this workaround for themes to work
    setTheme("system")
  }, [resolvedTheme, setTheme])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
