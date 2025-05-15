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
  const { adminPassword, contentData } = req.body
  
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
    if (!contentData.chapter_id || !contentData.title || !contentData.file_url || 
        contentData.order_number === undefined || !contentData.content_type) {
      return res.status(400).json({ 
        error: 'Missing required fields (chapter_id, title, file_url, content_type, or order_number)' 
      })
    }
    
    // Validate content type specific fields
    if (contentData.content_type === 'video' && (contentData.duration === null || contentData.duration === undefined)) {
      return res.status(400).json({ 
        error: 'Duration is required for video content' 
      })
    }
    
    if (contentData.content_type === 'pdf' && (contentData.page_count === null || contentData.page_count === undefined)) {
      return res.status(400).json({ 
        error: 'Page count is required for PDF content' 
      })
    }
    
    // Create the content using the admin client
    const { data, error } = await supabaseAdmin
      .from('content')
      .insert({
        chapter_id: contentData.chapter_id,
        title: contentData.title,
        description: contentData.description || null,
        content_type: contentData.content_type,
        file_url: contentData.file_url,
        duration: contentData.content_type === 'video' ? contentData.duration : null,
        page_count: contentData.content_type === 'pdf' ? contentData.page_count : null,
        order_number: contentData.order_number,
        is_free: contentData.is_free || false
      })
      .select()
      .single();

    if (error) {
      console.error('Error during content creation:', error)
      return res.status(400).json({ error: error.message })
    }
    
    return res.status(200).json({ 
      data: { content: data },
      message: 'Content added successfully'
    })
  } catch (error: unknown) {
    const err = error as Error & { 
      statusCode?: number;
      details?: string;
    }
    
    console.error('Admin content creation error:')
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