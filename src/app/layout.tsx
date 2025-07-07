import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Némai",
  description: "Connect with talented nail artists and book your next manicure masterpiece in just a few clicks.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json">
          {
            `{
              "@context" : "https://schema.org",
              "@type" : "WebSite",
              "name" : "Némai",
              "url" : "https://nemai.vercel.app/"
            }`
          }
        </script>
      </head>
      <body className={inter.className}>
        <TooltipProvider>
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">{children}</main>
          </div>
          <Toaster richColors />
        </TooltipProvider>
      </body>
    </html>
  )
}


import './globals.css'
