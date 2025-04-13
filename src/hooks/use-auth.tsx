"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

// Mock user types
type UserType = "artist" | "customer" | null
type User = { id: string; email: string } | null
type Profile = { id: string; first_name: string; last_name: string; user_type: UserType } | null

interface AuthContextType {
  user: User
  profile: Profile
  userType: UserType
  isLoading: boolean
  signUp: (email: string, password: string, userType: "artist" | "customer") => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (profile: Partial<Profile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock data
const MOCK_PROFILES = {
  artist: {
    id: "1",
    first_name: "Crystal",
    last_name: "Nguyen",
    user_type: "artist" as const,
  },
  customer: {
    id: "2",
    first_name: "Sarah",
    last_name: "Johnson",
    user_type: "customer" as const,
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [profile, setProfile] = useState<Profile>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check for stored auth in localStorage
    const storedAuth = localStorage.getItem("nailUnicornAuth")
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth)
        setUser(parsedAuth.user)
        setProfile(parsedAuth.profile)
      } catch (error) {
        console.error("Error parsing stored auth:", error)
      }
    }

    setIsLoading(false)
  }, [])

  const signUp = async (email: string, password: string, userType: "artist" | "customer") => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newUser = { id: `user-${Date.now()}`, email }
      const newProfile = userType === "artist" ? MOCK_PROFILES.artist : MOCK_PROFILES.customer

      setUser(newUser)
      setProfile(newProfile)

      // Store in localStorage
      localStorage.setItem(
        "nailUnicornAuth",
        JSON.stringify({
          user: newUser,
          profile: newProfile,
        }),
      )

      toast({
        title: "Sign up successful",
        description: "Your account has been created.",
      })

      return { error: null }
    } catch (err) {
      console.error("Error signing up:", err)
      return { error: err }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, we'll just check if the email contains "artist"
      const userType = email.includes("artist") ? "artist" : "customer"
      const newUser = { id: `user-${Date.now()}`, email }
      const newProfile = userType === "artist" ? MOCK_PROFILES.artist : MOCK_PROFILES.customer

      setUser(newUser)
      setProfile(newProfile)

      // Store in localStorage
      localStorage.setItem(
        "nailUnicornAuth",
        JSON.stringify({
          user: newUser,
          profile: newProfile,
        }),
      )

      toast({
        title: "Welcome back!",
        description: "You have been signed in.",
      })

      return { error: null }
    } catch (err) {
      console.error("Error signing in:", err)
      return { error: err }
    }
  }

  const signOut = async () => {
    setUser(null)
    setProfile(null)
    localStorage.removeItem("nailUnicornAuth")

    toast({
      title: "Signed out",
      description: "You have been signed out.",
    })
  }

  const updateProfile = async (updatedProfile: Partial<Profile>) => {
    try {
      if (!user || !profile) return { error: new Error("No user logged in") }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newProfile = { ...profile, ...updatedProfile }
      setProfile(newProfile)

      // Update localStorage
      localStorage.setItem(
        "nailUnicornAuth",
        JSON.stringify({
          user,
          profile: newProfile,
        }),
      )

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      return { error: null }
    } catch (err) {
      console.error("Error updating profile:", err)
      return { error: err }
    }
  }

  const value = {
    user,
    profile,
    userType: profile?.user_type || null,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
