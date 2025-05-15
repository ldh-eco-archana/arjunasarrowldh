import { createServerClient } from '@supabase/ssr'
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next'

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