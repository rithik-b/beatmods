import "@beatmods/styles/globals.css"

import { cookies } from "next/headers"

import { TRPCReactProvider } from "@beatmods/trpc/react"
import { GeistSans } from "geist/font/sans"
import { Providers } from "@beatmods/components/Providers"
import Sidebar from "./_components/Sidebar"
import { ScrollArea } from "@beatmods/components/ui/scroll-area"

export const metadata = {
  title: "BeatMods",
  description: "Beat Saber",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <TRPCReactProvider cookies={cookies().toString()}>
        <body className={`font-sans ${GeistSans.className} h-full`}>
          <Providers>
            <main className="flex h-full flex-row gap-2">
              <Sidebar />
              <div className="h-full w-full py-2 pr-2">
                <ScrollArea className="h-full rounded-md border">
                  <section className="h-full p-5">{children}</section>
                </ScrollArea>
              </div>
            </main>
          </Providers>
        </body>
      </TRPCReactProvider>
    </html>
  )
}
