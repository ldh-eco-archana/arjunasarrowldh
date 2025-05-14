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
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Get admin password from environment variable
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
  
  if (!ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD environment variable is not set')
    return res.status(500).json({ 
      error: 'Server configuration error: Admin password not set', 
      status: 'failed'
    })
  }

  // Simple admin password verification
  const { adminPassword, userId } = req.body
  
  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ 
      error: 'Service role key is not configured on the server' 
    })
  }
  
  try {
    // Delete the user using the admin client
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
      console.error('Error deleting user:', error)
      return res.status(400).json({ error })
    }
    
    return res.status(200).json({ 
      message: 'User deleted successfully' 
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Error in delete user handler:', err)
    return res.status(500).json({ 
      error: err.message || 'An unknown error occurred' 
    })
  }
} 