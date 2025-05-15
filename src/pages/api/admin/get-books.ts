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
  const { adminPassword } = req.body
  
  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ 
      error: 'Service role key is not configured on the server' 
    })
  }
  
  try {
    // Get all books with their course information
    const { data, error } = await supabaseAdmin
      .from('books')
      .select(`
        id,
        title,
        description,
        cover_image_url,
        course_id,
        courses:course_id (
          id,
          name,
          board,
          class
        )
      `)
      .order('title');
    
    if (error) {
      console.error('Error fetching books:', error)
      return res.status(400).json({ error: error.message })
    }
    
    return res.status(200).json({ 
      data: { books: data }
    })
  } catch (error: unknown) {
    const err = error as Error & { 
      statusCode?: number;
      details?: string;
    }
    
    console.error('Admin books fetch error:', err)
    
    return res.status(500).json({ 
      error: err.message || 'An unknown error occurred',
      details: err.details || err.stack?.split('\n')[0] || 'No additional details' 
    })
  }
} 