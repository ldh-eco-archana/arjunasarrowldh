import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextApiRequest, type NextApiResponse } from 'next'
import { createServerClient } from '@supabase/ssr'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void | NextApiResponse> {
  const { token_hash, type, next = '/' } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (token_hash && type) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          get(name: string) {
            return req.cookies[name]
          },
          set(name: string, value: string, _: Record<string, unknown>) {
            res.setHeader('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`)
          },
          remove(name: string, _: Record<string, unknown>) {
            res.setHeader('Set-Cookie', `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: token_hash as string,
    })

    if (!error) {
      return res.redirect(next as string)
    }
  }

  // Return to error page if something went wrong
  return res.redirect('/error')
} 