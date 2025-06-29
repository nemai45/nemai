import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "../globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Nemai - Book Nail Artists in Surat",
  description: "India's first platform to book nail artists near you. Explore designs, book appointments, and confirm your booking in just a few clicks.",
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

