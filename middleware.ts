import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Define routes that require authentication
const protectedRoutes = ['/dashboard', '/chapter', '/profile', '/settings']

// Define routes that should redirect authenticated users (like login)
const guestOnlyRoutes = ['/login', '/signup', '/forgot-password']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Update session (this is fast and doesn't verify JWT)
  const response = await updateSession(request)
  
  // Check if the route needs protection
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isGuestOnlyRoute = guestOnlyRoutes.some(route => pathname.startsWith(route))
  
  // Quick session check without expensive JWT verification
  // Access cookies via headers like the supabase middleware does
  const getCookie = (name: string): string | undefined => {
    return request.headers.get('cookie')?.split('; ')
      .find(row => row.startsWith(`${name}=`))
      ?.split('=')[1]
  }
  
  // Check for various supabase auth cookie names
  const authCookie = getCookie('sb-access-token') || 
                     getCookie('sb-refresh-token') ||
                     getCookie('supabase-auth-token') ||
                     getCookie('sb-localhost-auth-token')
  
  const hasSession = !!authCookie
  
  // Redirect logic for protected routes
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // For guest-only routes, we let client-side handle redirects for better UX
  // This avoids the slow server-side check while still providing basic protection
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 