import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { createClient } from "@/utils/supabase/server"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "../globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Nemai",
  description: "Connect with talented nail artists and book your next manicure masterpiece in just a few clicks.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode,
}>) {
  return (
    <>
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </>
  )
}

