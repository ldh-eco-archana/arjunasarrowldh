import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/utils/supabase/server';
import fetch from 'node-fetch';

// Set a short expiration time for signed URLs (10 minutes)
const SIGNED_URL_EXPIRY = 600;

// Define interfaces for the nested data structure
interface BookData {
  course_id: string;
}

interface ChapterData {
  book_id: string;
  books: BookData;
}

interface ContentData {
  id: string;
  is_free: boolean;
  chapter_id: string;
  chapters: ChapterData;
}

// Helper function to check if the signed URL is accessible
async function validateSignedUrl(url: string): Promise<boolean> {
  try {
    // Use HEAD request to check if the URL is accessible without downloading the content
    const response = await fetch(url, { method: 'HEAD' });
    
    // Convert headers to object without using spread syntax on iterator
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    console.log('[serve-video] Validation response:', { 
      status: response.status,
      headers
    });
    
    return response.ok;
  } catch (error) {
    console.error('[serve-video] URL validation error:', error);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  console.log('[serve-video] Request received with query params:', req.query);

  if (req.method !== 'GET') {
    console.log('[serve-video] Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract the file ID and chapter ID from the query parameters
  const { id, chapterId } = req.query;
  
  if (!id || !chapterId) {
    console.log('[serve-video] Missing required parameters');
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Create Supabase server client with cookies
    const supabase = createClient({ req, res });

    // Authenticate the user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('[serve-video] Authentication failed:', authError);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user profile to check subscription status
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('subscription_end_date, is_active')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.log('[serve-video] Failed to get user profile:', profileError);
      return res.status(500).json({ error: 'Failed to get user profile' });
    }

    // Check if user has an active subscription
    const now = new Date();
    const subscriptionEndDate = new Date(profile.subscription_end_date);
    
    if (!profile.is_active || subscriptionEndDate < now) {
      console.log('[serve-video] Subscription expired or inactive:', { 
        isActive: profile.is_active, 
        endDate: profile.subscription_end_date 
      });
      return res.status(403).json({ error: 'Subscription expired' });
    }

    // Check if the content belongs to a chapter the user has access to
    const { data: contentData, error: contentError } = await supabase
      .from('content')
      .select(`
        id, 
        is_free,
        chapter_id,
        chapters!inner(
          book_id,
          books!inner(
            course_id
          )
        )
      `)
      .eq('chapter_id', chapterId)
      .eq('content_type', 'video')
      .eq('file_url', `/api/content/serve-video?id=${id}&chapterId=${chapterId}`)
      .single();

    if (contentError || !contentData) {
      console.log('[serve-video] Content not found:', { chapterId, contentType: 'video' });
      return res.status(404).json({ error: 'Content not found' });
    }

    // If content is not free, check if user is enrolled in the course
    if (!contentData.is_free) {
      // Cast the contentData to our interface type to access nested structure
      const typedContentData = contentData as unknown as ContentData;
      const courseId = typedContentData.chapters.books.course_id;
      
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('user_courses')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (enrollmentError || !enrollment) {
        console.log('[serve-video] User not enrolled in course:', { userId: user.id, courseId });
        return res.status(403).json({ error: 'Not enrolled in this course' });
      }
    }

    // Define the extensions to try
    const extensions = ['.mp4', '.webm', '.mov', '.avi'];
    let signedUrl = null;
    let fileExists = false;

    // Try each possible extension until we find the file
    for (const ext of extensions) {
      const fileName = `${id}${ext}`;
      const filePath = `${chapterId}/${fileName}`;
      
      // Check if file exists
      const { data, error } = await supabase.storage
        .from('secure-video-content')
        .createSignedUrl(filePath, SIGNED_URL_EXPIRY);
      
      if (!error && data) {
        signedUrl = data.signedUrl;
        fileExists = true;
        console.log('[serve-video] File found with extension:', ext);
        break;
      } else {
        console.log('[serve-video] File not found with extension:', ext);
      }
    }

    if (!fileExists || !signedUrl) {
      console.log('[serve-video] Video file not found for all extensions');
      return res.status(404).json({ error: 'Video file not found' });
    }

    // Validate the signed URL
    const isUrlValid = await validateSignedUrl(signedUrl);
    console.log('[serve-video] URL validation result:', { isUrlValid });

    // Update user course progress if relevant
    try {
      // Cast the contentData to our interface type to access nested structure
      const typedContentData = contentData as unknown as ContentData;
      const courseId = typedContentData.chapters.books.course_id;
      
      await supabase.rpc('update_user_content_access', {
        content_id_param: contentData.id,
        user_id_param: user.id,
        course_id_param: courseId
      });
    } catch (progressError) {
      console.error('[serve-video] Failed to update progress:', progressError);
      // Continue serving the video even if progress update fails
    }
    
    // Set CORS headers to allow video streaming
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges');
    
    // Check if the URL has a redirect to the actual MP4 file and get that URL directly
    try {
      const checkResponse = await fetch(signedUrl, { method: 'HEAD', redirect: 'manual' });
      
      if (checkResponse.status >= 300 && checkResponse.status < 400 && checkResponse.headers.get('location')) {
        const directUrl = checkResponse.headers.get('location');
        console.log('[serve-video] Found direct video URL through redirect');
        signedUrl = directUrl;
      }
    } catch (redirectError) {
      console.error('[serve-video] Error checking redirect:', redirectError);
      // Continue with original URL if there's an error
    }
    
    return res.status(200).json({ 
      url: signedUrl,
      expiresIn: SIGNED_URL_EXPIRY,
      timestamp: Date.now(),
      contentId: contentData.id
    });
  } catch (error) {
    console.error('[serve-video] Unhandled error:', error);
    return res.status(500).json({ error: 'Failed to serve video' });
  }
} 