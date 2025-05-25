import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/utils/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, chapterId } = req.query;
  
  if (!id || !chapterId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const supabase = createClient({ req, res });

    // Basic auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Simple file path - assume .mp4
    const filePath = `${chapterId}/${id}.mp4`;
    
    // Create signed URL (1 hour expiry)
    const { data, error } = await supabase.storage
      .from('secure-video-content')
      .createSignedUrl(filePath, 3600);

    if (error || !data) {
      return res.status(404).json({ error: 'Video not found' });
    }

    return res.status(200).json({ 
      url: data.signedUrl
    });
    
  } catch (error) {
    console.error('Error serving video:', error);
    return res.status(500).json({ error: 'Failed to serve video' });
  }
} 