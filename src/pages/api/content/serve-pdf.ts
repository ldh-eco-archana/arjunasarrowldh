import { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { createClient } from '@/utils/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  console.log('[serve-pdf] Request received with query params:', req.query);

  // Only handle GET requests
  if (req.method !== 'GET') {
    console.log('[serve-pdf] Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Initialize Supabase server client with auth context
  const supabase = createClient({ req, res });
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.log('[serve-pdf] Authentication failed:', authError);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { id, chapterId } = req.query;
  
  if (!id || !chapterId || typeof id !== 'string' || typeof chapterId !== 'string') {
    console.log('[serve-pdf] Invalid parameters:', { id, chapterId });
    return res.status(400).json({ error: 'Invalid parameters' });
  }
  
  try {
    // Get user information for watermarking
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('first_name, last_name, email, subscription_end_date, is_active')
      .eq('id', user.id)
      .single();
    
    if (userError || !userData) {
      console.log('[serve-pdf] Failed to get user profile:', userError);
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has an active subscription
    const now = new Date();
    const subscriptionEndDate = new Date(userData.subscription_end_date);
    
    if (!userData.is_active || subscriptionEndDate < now) {
      console.log('[serve-pdf] Subscription expired or inactive:', { 
        isActive: userData.is_active, 
        endDate: userData.subscription_end_date 
      });
      return res.status(403).json({ error: 'Subscription required' });
    }
    
    // Check if user has access to the content
    const fileName = `${id}.pdf`;
    const filePath = `${chapterId}/${fileName}`;
    
    // Get content information to check if it's free or paid
    const { data: contentData } = await supabase
      .from('content')
      .select('is_free, id')
      .eq('chapter_id', chapterId)
      .eq('file_url', `/api/content/serve-pdf?id=${id}&chapterId=${chapterId}`)
      .single();
    
    // If the content isn't found, or an error occurs, still try to serve the file
    // This is to handle legacy content or special cases
    const isFree = contentData?.is_free || false;
    
    // If it's not free content, make sure the user has an active subscription
    if (!isFree && (!userData.is_active || subscriptionEndDate < now)) {
      console.log('[serve-pdf] Paid content requires subscription');
      return res.status(403).json({ error: 'This content requires an active subscription' });
    }
    
    // Fetch the PDF from storage
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('secure-pdf-content')
      .download(filePath);
    
    if (fileError || !fileData) {
      console.error('[serve-pdf] File download failed:', { 
        error: fileError?.message, 
        filePath, 
        bucket: 'secure-pdf-content'
      });
      
      // Check if the file exists before attempting to download
      const { data: fileListData, error: fileListError } = await supabase
        .storage
        .from('secure-pdf-content')
        .list(chapterId);
        
      if (fileListError) {
        console.error('[serve-pdf] Error listing files in directory:', fileListError);
      } else {
        const filesInDirectory = fileListData.map(f => f.name);
        console.log('[serve-pdf] Files in directory:', { directory: chapterId, files: filesInDirectory });
        
        if (filesInDirectory.includes(fileName)) {
          console.log('[serve-pdf] File exists but could not be downloaded');
        } else {
          console.log('[serve-pdf] File does not exist in the directory');
        }
      }
      
      return res.status(404).json({ 
        error: 'File not found',
        details: fileError?.message,
        path: filePath
      });
    }
    
    // Load the PDF and add watermark
    const pdfDoc = await PDFDocument.load(await fileData.arrayBuffer());
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Create user watermark text
    const userWatermark = `${userData.first_name} ${userData.last_name} (${userData.email})`;
    
    // Add mobile-friendly diagonal watermark to each page
    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // Calculate optimal watermark size based on page dimensions
      // This makes the watermark properly sized on both desktop and mobile views
      const pageArea = width * height;
      const baseSize = Math.sqrt(pageArea) / 30; // Scale watermark size based on page area
      const watermarkSize = Math.max(Math.min(baseSize, 20), 14); // Between 14 and 20
      
      // Calculate watermark width to correctly center the text
      const textWidth = watermarkSize * userWatermark.length * 0.5;
      
      // Add a more prominent diagonal watermark in center
      page.drawText(userWatermark, {
        x: width / 2 - textWidth / 3, // Center the text more accurately
        y: height / 2,
        size: watermarkSize,
        font,
        color: rgb(0.82, 0.82, 0.82), // Light gray
        opacity: 0.6,
        rotate: degrees(45),
      });
      
      // Add a second, perpendicular watermark for better coverage
      // This ensures that in any view orientation, at least one watermark is clearly visible
      page.drawText(userWatermark, {
        x: width / 2 + textWidth / 6,
        y: height / 2,
        size: watermarkSize,
        font,
        color: rgb(0.82, 0.82, 0.82), // Light gray
        opacity: 0.6,
        rotate: degrees(-45),
      });
    }
    
    // Set document metadata
    pdfDoc.setTitle("Arjuna's Arrow");
    pdfDoc.setAuthor("Arjuna's Arrow");
    pdfDoc.setCreator("Coursespace");
    pdfDoc.setProducer("Coursespace");
    
    // Serialize the modified PDF
    const modifiedPdfBytes = await pdfDoc.save({
      useObjectStreams: false,
    });
    
    // Return the watermarked PDF with appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    
    // Set optimized cache headers for better performance
    res.setHeader('Cache-Control', 'private, max-age=1800, stale-while-revalidate=3600'); // 30-minute cache with 1-hour stale
    res.setHeader('ETag', `"${user.id}-${id}-${chapterId}"`); // Add ETag for better caching
    
    // Add CORS headers for embedding
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Add performance headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Accept-Ranges', 'bytes');
    
    return res.status(200).send(Buffer.from(modifiedPdfBytes));
  } catch (error) {
    console.error('[serve-pdf] Unhandled error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 