import { NextRequest, NextResponse } from 'next/server'

// Import helper functions from utils
import { hasValidCognitoSession } from './src/utils/cognito/session'

// Define routes that require authentication
const protectedRoutes = ['/dashboard', '/chapter', '/profile', '/change-password']

// Define routes that should redirect authenticated users
const guestOnlyRoutes = ['/login', '/signup', '/forgot-password', '/reset-password']

// Fast cookie-based session check - no async operations
function hasAuthCookies(request: NextRequest): boolean {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return false
  
  // Check for Cognito-specific cookies that indicate an active session
  // These patterns match AWS Amplify's cookie naming conventions
  const cognitoCookiePatterns = [
    'CognitoIdentityServiceProvider',
    'amplify-signin-with-hostedUI',
    'LastAuthUser'
  ]
  
  return cognitoCookiePatterns.some(pattern => cookieHeader.includes(pattern))
}

// Middleware function that runs on every request
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  
  // Check if the route needs protection
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isGuestOnlyRoute = guestOnlyRoutes.some(route => pathname.startsWith(route))
  
  // Fast synchronous cookie check
  const hasAuth = hasAuthCookies(request)
  
  // Check for valid session
  if (!hasValidCognitoSession(request)) {
    // Handle unauthenticated users if needed
    // For example, redirect to login page
    // return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // Only redirect for protected routes without auth cookies
  // Let client-side handle auth validation for better UX
  if (isProtectedRoute && !hasAuth) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // For guest routes with auth cookies, let client handle redirect
  // This prevents flashing of the login page
  
  return NextResponse.next()
}

// Optional: Configure which paths should trigger this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml
     * - images, fonts, and other static assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images/|fonts/).*)',
  ],
} 