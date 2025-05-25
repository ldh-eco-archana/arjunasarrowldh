import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/utils/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Only handle GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, chapterId } = req.query;
  
  if (!id || !chapterId || typeof id !== 'string' || typeof chapterId !== 'string') {
    return res.status(400).json({ error: 'Invalid parameters' });
  }
  
  try {
    // Initialize Supabase server client with auth context
    const supabase = createClient({ req, res });
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Simple file path
    const fileName = `${id}.pdf`;
    const filePath = `${chapterId}/${fileName}`;
    
    // Fetch the PDF from storage
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('secure-pdf-content')
      .download(filePath);
    
    if (fileError || !fileData) {
      return res.status(404).json({ 
        error: 'PDF not found',
        details: fileError?.message,
        path: filePath
      });
    }

    // Convert blob to buffer and serve directly
    const pdfBuffer = Buffer.from(await fileData.arrayBuffer());
    
    // Set appropriate headers for PDF serving
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'private, max-age=1800');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return res.status(200).send(pdfBuffer);
    
  } catch (error) {
    console.error('[serve-pdf] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 