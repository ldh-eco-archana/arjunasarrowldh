import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/utils/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Only handle GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id, chapterId } = req.query;
  
  if (!id || !chapterId || typeof id !== 'string' || typeof chapterId !== 'string') {
    res.status(400).json({ error: 'Invalid parameters' });
    return;
  }
  
  try {
    // Initialize Supabase server client with auth context
    const supabase = createClient({ req, res });
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const fileName = `${id}.pdf`;
    const filePath = `${chapterId}/${fileName}`;
    
    // Generate ETag for caching (based on file path)
    const etag = Buffer.from(filePath).toString('base64');
    
    // Check if client has cached version (HTTP 304)
    const clientETag = req.headers['if-none-match'];
    if (clientETag === `"${etag}"`) {
      res.status(304).end();
      return;
    }
    
    // Check if-modified-since header
    const ifModifiedSince = req.headers['if-modified-since'];
    if (ifModifiedSince) {
      // For static content, we can assume it hasn't changed
      // You could add actual file modification checking here if needed
      res.status(304).end();
      return;
    }
    
    // Fetch the PDF from storage
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('secure-pdf-content')
      .download(filePath);
    
    if (fileError || !fileData) {
      res.status(404).json({ 
        error: 'PDF not found',
        details: fileError?.message,
        path: filePath
      });
      return;
    }

    // Convert blob to buffer
    const pdfBuffer = Buffer.from(await fileData.arrayBuffer());
    
    // Set aggressive caching headers for Vercel Edge Network
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    
    // Aggressive browser caching (24 hours)
    res.setHeader('Cache-Control', 'private, max-age=86400, stale-while-revalidate=604800');
    
    // ETag for conditional requests
    res.setHeader('ETag', `"${etag}"`);
    
    // Last-Modified header (use current time for simplicity, or actual file time if available)
    res.setHeader('Last-Modified', new Date().toUTCString());
    
    // Vercel Edge Network caching (if user upgrades)
    res.setHeader('CDN-Cache-Control', 'max-age=86400');
    
    // Security headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Optional: Add content length for better performance
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    
    res.status(200).send(pdfBuffer);
    
  } catch (error) {
    console.error('[serve-pdf-vercel] Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

// Export config for Vercel optimization
export const config = {
  api: {
    // Increase body size limit for large PDFs
    bodyParser: {
      sizeLimit: '50mb',
    },
    // Increase response size limit
    responseLimit: '50mb',
  },
} 