"use client"

import type React from "react"

import { AuthProvider as AuthProviderComponent } from "@/hooks/use-auth"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProviderComponent>{children}</AuthProviderComponent>
}
