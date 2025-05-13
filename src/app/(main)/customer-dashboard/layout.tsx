import type React from "react"
export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="py-6 bg-muted/30">{children}</div>
}
