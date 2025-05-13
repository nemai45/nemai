import { JWTPayload, jwtVerify } from "jose"
 
import { createClient } from "@/utils/supabase/server"
 
// Extend the JWTPayload type to include Supabase-specific metadata
export type SupabaseJwtPayload = JWTPayload & {
  user_role: string
}
 
export async function getUserRole() {
  const supabase = await createClient()
 
  const {
    data: { session },
  } = await supabase.auth.getSession()
 
  let role
 
  if (session) {
    const token = session.access_token
 
    try {
      const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET)
 
      const { payload } = await jwtVerify<SupabaseJwtPayload>(token, secret)
 
      role = payload.user_role
    } catch (error) {
      return null
    }
  }
 
  return role
}