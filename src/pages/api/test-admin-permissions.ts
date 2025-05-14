import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Only allow admin operations in development mode
  const isDevelopment = process.env.NODE_ENV === 'development'
  if (!isDevelopment) {
    return res.status(403).json({ 
      error: 'Admin operations are restricted to development mode only',
      status: 'failed'
    })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ 
      error: 'Service role key is not configured on the server',
      status: 'failed'
    })
  }

  try {
    // Test admin permissions by trying to get list of users
    // This operation requires admin privileges
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) {
      console.error('Admin test failed:', error)
      return res.status(400).json({ 
        error: error.message,
        status: 'failed' 
      })
    }

    return res.status(200).json({ 
      message: 'Service role key has admin permissions',
      userCount: data.users.length,
      status: 'success'
    })
    
  } catch (error: unknown) {
    const err = error as Error
    console.error('Admin test error:', err)
    return res.status(500).json({ 
      error: err.message || 'An unknown error occurred',
      status: 'failed'
    })
  }
} 