import { SupabaseJwtPayload } from "@/lib/get-user-role"
import { createClient } from "@/utils/supabase/client"
import { AuthError, Session, User } from "@supabase/supabase-js"
import { jwtDecode } from "jwt-decode"
import { useEffect, useState } from "react"
 
 
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const supabase = createClient()
 
  useEffect(() => {
    async function fetchUser() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) throw error
 
        if (session) {
          setSession(session)
          setUser(session.user)
          const decodedJwt = jwtDecode<SupabaseJwtPayload>(session.access_token)
          setRole(decodedJwt.user_role)
        }
      } catch (error) {
        setError(error as AuthError)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])
 
  return { loading, error, session, user, role }
}