import "@beatmods/styles/globals.css"

import { cookies } from "next/headers"

import { TRPCReactProvider } from "@beatmods/trpc/react"
import { GeistSans } from "geist/font/sans"

export const metadata = {
  title: "BeatMods",
  description: "Beat Saber",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.className}`}>
        <TRPCReactProvider cookies={cookies().toString()}>
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  )
}
