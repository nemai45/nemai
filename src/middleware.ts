import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware' 

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/webhook/razorpay|sitemap.xml|robots.txt|google0e1480d09a990711.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}