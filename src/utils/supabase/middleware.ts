import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookieValue = request.headers.get('cookie')?.split('; ')
            .find(row => row.startsWith(`${name}=`))
            ?.split('=')[1]
          return cookieValue
        },
        set(name: string, value: string, options: CookieOptions) {
          const { sameSite, domain, path, secure, httpOnly, expires, maxAge } = options || {}
          
          response.headers.append(
            'Set-Cookie', 
            `${name}=${value}` +
            (httpOnly ? '; HttpOnly' : '') +
            (secure ? '; Secure' : '') +
            (expires ? `; Expires=${expires.toUTCString()}` : '') +
            (maxAge ? `; Max-Age=${maxAge}` : '') +
            (domain ? `; Domain=${domain}` : '') +
            (path ? `; Path=${path}` : '') +
            (sameSite ? `; SameSite=${sameSite}` : '')
          )
        },
        remove(name: string, options: CookieOptions) {
          const { sameSite, domain, path, secure } = options || {}
          
          response.headers.append(
            'Set-Cookie', 
            `${name}=; Max-Age=0` +
            (secure ? '; Secure' : '') +
            (domain ? `; Domain=${domain}` : '') +
            (path ? `; Path=${path}` : '') +
            (sameSite ? `; SameSite=${sameSite}` : '')
          )
        },
      },
    }
  )

  // This will refresh the session if it exists
  await supabase.auth.getUser()

  return response
} 