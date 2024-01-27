import "@beatmods/styles/globals.css"

import { cookies } from "next/headers"

import { TRPCReactProvider } from "@beatmods/trpc/react"
import { GeistSans } from "geist/font/sans"
import { ThemeProvider } from "@beatmods/components/ThemeProvider"
import Sidebar from "./_components/Sidebar"

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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <TRPCReactProvider cookies={cookies().toString()}>
        <body className={`font-sans ${GeistSans.className} h-full`}>
          <ThemeProvider
            {...props}
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="flex h-full flex-row">
              <Sidebar />
              <section className="h-full w-full border-l">{children}</section>
            </main>
          </ThemeProvider>
        </body>
      </TRPCReactProvider>
    </html>
  )
}
