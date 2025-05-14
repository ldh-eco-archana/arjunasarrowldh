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
  const { adminPassword, userData } = req.body
  
  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ 
      error: 'Service role key is not configured on the server' 
    })
  }
  
  try {
    // Create the user with email verification pre-confirmed using the admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Pre-verify the email
      user_metadata: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        mobile: userData.mobile,
        school_name: userData.schoolName,
        city: userData.city,
        current_class: userData.currentClass,
        board: userData.board,
      },
    })

    if (authError) {
      console.error('Auth error during user creation:', authError)
      return res.status(400).json({ error: authError })
    }
    
    return res.status(200).json({ 
      data: { user: authData.user }
    })
  } catch (error: unknown) {
    const err = error as Error & { 
      statusCode?: number;
      details?: string;
    }
    
    console.error('Admin user creation error:')
    console.error('Error name:', err.name)
    console.error('Error message:', err.message)
    console.error('Error stack:', err.stack)
    
    // If it's a Supabase error, it might have additional details
    if (err.statusCode) {
      console.error('Status code:', err.statusCode)
    }
    if (err.details) {
      console.error('Error details:', err.details)
    }
    
    return res.status(500).json({ 
      error: err.message || 'An unknown error occurred',
      details: err.details || err.stack?.split('\n')[0] || 'No additional details' 
    })
  }
} 