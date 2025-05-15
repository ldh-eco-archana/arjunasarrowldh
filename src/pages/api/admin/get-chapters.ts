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
  const { adminPassword, bookId } = req.body
  
  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ 
      error: 'Service role key is not configured on the server' 
    })
  }
  
  try {
    let data;
    let error;

    // If bookId is provided, fetch basic chapter info
    if (bookId) {
      const result = await supabaseAdmin
        .from('chapters')
        .select('id, title, book_id, order_number')
        .eq('book_id', bookId)
        .order('order_number');
      
      data = result.data;
      error = result.error;
    } else {
      // If no bookId provided, include book and course info for display
      const result = await supabaseAdmin
        .from('chapters')
        .select(`
          id,
          title,
          book_id,
          order_number,
          book:books (
            id,
            title,
            course_id,
            course:courses (
              id,
              name,
              board,
              class
            )
          )
        `)
        .order('title');
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error during chapters fetch:', error)
      return res.status(400).json({ error: error.message })
    }
    
    return res.status(200).json({ 
      data: { chapters: data },
      message: 'Chapters fetched successfully'
    })
  } catch (error: unknown) {
    const err = error as Error & { 
      statusCode?: number;
      details?: string;
    }
    
    console.error('Admin chapters fetch error:')
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