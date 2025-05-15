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
  const { adminPassword, chapterData } = req.body
  
  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ 
      error: 'Service role key is not configured on the server' 
    })
  }
  
  try {
    // Validate required fields
    if (!chapterData.book_id || !chapterData.title || !chapterData.description || chapterData.order_number === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields (book_id, title, description, or order_number)' 
      })
    }
    
    // Create the chapter using the admin client
    const { data, error } = await supabaseAdmin
      .from('chapters')
      .insert({
        book_id: chapterData.book_id,
        title: chapterData.title,
        description: chapterData.description,
        order_number: chapterData.order_number
      })
      .select()
      .single();

    if (error) {
      console.error('Error during chapter creation:', error)
      return res.status(400).json({ error: error.message })
    }
    
    return res.status(200).json({ 
      data: { chapter: data },
      message: 'Chapter added successfully'
    })
  } catch (error: unknown) {
    const err = error as Error & { 
      statusCode?: number;
      details?: string;
    }
    
    console.error('Admin chapter creation error:')
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