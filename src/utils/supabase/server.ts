import { createServerClient } from '@supabase/ssr'
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next'
import { AuthError } from '@supabase/supabase-js'
import { SupabaseSafeSession, type SupabaseSafeUserResponse } from './safe-session'

type SupabaseServerContext = 
  | { req: NextApiRequest; res: NextApiResponse }
  | GetServerSidePropsContext
  | { req: { cookies: { [key: string]: string } } }

export function createClient(context: SupabaseServerContext) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return context.req.cookies[name]
        },
        set(name: string, value: string, options: any) {
          if ('res' in context) {
            context.res.setHeader('Set-Cookie', 
              `${name}=${value}; Path=/; ${options.httpOnly ? 'HttpOnly;' : ''} ${options.secure ? 'Secure;' : ''}`
            )
          }
        },
        remove(name: string, options: any) {
          if ('res' in context) {
            context.res.setHeader('Set-Cookie', 
              `${name}=; Max-Age=0; Path=/; ${options.secure ? 'Secure;' : ''}`
            )
          }
        },
      },
    }
  )
}

/**
 * Fast and secure user authentication using JWT verification
 * This is much faster than the traditional supabase.auth.getUser() approach
 * and maintains security by verifying the JWT token
 */
export async function getSafeUser(context: SupabaseServerContext): Promise<SupabaseSafeUserResponse> {
  const supabase = createClient(context)
  
  if (!process.env.SUPABASE_JWT_SECRET) {
    console.warn('SUPABASE_JWT_SECRET not found. Falling back to slower auth method. See SUPABASE_JWT_SETUP.md for setup instructions.')
    
    // Fallback to traditional method if JWT secret is not configured
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        return { data: null, error: error || new AuthError('No user found') }
      }
      
      // Convert to SupabaseSafeUser format
      return {
        data: {
          id: user.id,
          session_id: '', // Not available in traditional method
          role: user.role || null,
          email: user.email || null,
          phone: user.phone || null,
          app_metadata: user.app_metadata || {},
          user_metadata: user.user_metadata || {},
        },
        error: null
      }
    } catch (fallbackError) {
      return { data: null, error: new AuthError('Authentication failed') }
    }
  }
  
  const safeSession = new SupabaseSafeSession(supabase, process.env.SUPABASE_JWT_SECRET)
  return await safeSession.getUser()
} 