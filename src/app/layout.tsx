import "@beatmods/styles/globals.css"

import { cookies } from "next/headers"

import { TRPCReactProvider } from "@beatmods/trpc/react"
import { GeistSans } from "geist/font/sans"
import { ThemeProvider } from "@beatmods/components/ThemeProvider"

export const metadata = {
  title: "BeatMods",
  description: "Beat Saber",
}

export default function RootLayout({
  children,
  ...props
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <TRPCReactProvider cookies={cookies().toString()}>
        <body className={`font-sans ${GeistSans.className}`}>
          <ThemeProvider
            {...props}
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </TRPCReactProvider>
    </html>
  )
}
