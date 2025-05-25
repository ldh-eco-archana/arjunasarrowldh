import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabaseClient'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib'
import { v4 as uuidv4 } from 'uuid'
import { parseBuffer } from 'music-metadata'
import ffprobeStatic from 'ffprobe-static'
import { execSync } from 'child_process'

// Disable the default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  console.log('[upload-content] Request received', { 
    method: req.method,
    url: req.url,
    headers: {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length']
    }
  })
  
  // Only allow admin operations in development mode
  const isDevelopment = process.env.NODE_ENV === 'development'
  console.log('[upload-content] Environment check', { isDevelopment })
  
  if (!isDevelopment) {
    console.log('[upload-content] Rejecting request: Not in development mode')
    return res.status(403).json({ 
      error: 'Admin operations are restricted to development mode only',
      status: 'failed'
    })
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('[upload-content] Rejecting request: Invalid method', { method: req.method })
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Get admin password from environment variable
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
  console.log('[upload-content] Admin password environment variable', { 
    isSet: !!ADMIN_PASSWORD,
    length: ADMIN_PASSWORD?.length || 0
  })
  
  if (!ADMIN_PASSWORD) {
    console.error('[upload-content] ADMIN_PASSWORD environment variable is not set')
    return res.status(500).json({ 
      error: 'Server configuration error: Admin password not set',
      status: 'failed'
    })
  }

  try {
    console.log('[upload-content] Starting form parsing')
    
    // Parse the form data
    const form = formidable({ 
      maxFileSize: 500 * 1024 * 1024, // 500MB max file size
      keepExtensions: true 
    })
    
    console.log('[upload-content] Form config created')
    
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      console.log('[upload-content] Beginning to parse request')
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('[upload-content] Form parsing error', err)
          reject(err)
        } else {
          console.log('[upload-content] Form parsed successfully', { 
            fieldKeys: Object.keys(fields),
            fileKeys: Object.keys(files)
          })
          resolve([fields, files])
        }
      })
    })

    console.log('[upload-content] Parsed form data', { 
      contentType: fields.contentType,
      chapterId: fields.chapterId,
      adminPasswordProvided: !!fields.adminPassword,
      adminPasswordLength: fields.adminPassword ? String(fields.adminPassword).length : 0,
      fileProvided: !!files.file
    })

    // Verify admin password
    const adminPassword = Array.isArray(fields.adminPassword) 
      ? fields.adminPassword[0] 
      : (fields.adminPassword || '') // Default to empty string if undefined
    console.log('[upload-content] Admin password verification', { 
      adminPasswordMatch: adminPassword === ADMIN_PASSWORD,
      providedLength: adminPassword?.length || 0,
      expectedLength: ADMIN_PASSWORD.length,
    })
    
    if (adminPassword !== ADMIN_PASSWORD) {
      console.error('[upload-content] Admin password mismatch - Unauthorized')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    console.log('[upload-content] Admin password verified successfully')

    const contentType = Array.isArray(fields.contentType)
      ? fields.contentType[0]
      : (fields.contentType || '') // Default to empty string if undefined
    if (contentType !== 'pdf' && contentType !== 'video') {
      console.error('[upload-content] Invalid content type', { contentType })
      return res.status(400).json({ error: 'Invalid content type. Must be "pdf" or "video"' })
    }

    const chapterId = Array.isArray(fields.chapterId)
      ? fields.chapterId[0]
      : (fields.chapterId || '') // Default to empty string if undefined
    if (!chapterId) {
      console.error('[upload-content] Missing chapter ID')
      return res.status(400).json({ error: 'Chapter ID is required' })
    }

    if (!supabaseAdmin) {
      console.error('[upload-content] Supabase admin client not initialized')
      return res.status(500).json({ 
        error: 'Service role key is not configured on the server' 
      })
    }

    console.log('[upload-content] Basic validations passed')

    // Get uploaded file
    const fileField = files.file
    const file = Array.isArray(fileField) ? fileField[0] : fileField
    
    if (!file) {
      console.error('[upload-content] No file found in request')
      return res.status(400).json({ error: 'No file uploaded' })
    }

    console.log('[upload-content] File info', { 
      originalFilename: file.originalFilename,
      newFilename: file.newFilename,
      filepath: file.filepath,
      size: file.size,
      mimetype: file.mimetype
    })

    // Get file extension
    const fileExt = path.extname(file.originalFilename || '').toLowerCase()
    console.log('[upload-content] File extension', { fileExt })
    
    // Validate file type
    if (contentType === 'pdf' && fileExt !== '.pdf') {
      console.error('[upload-content] File extension mismatch for PDF', { fileExt })
      return res.status(400).json({ error: 'Expected PDF file but received a different format' })
    }
    
    if (contentType === 'video' && !['.mp4', '.webm', '.mov', '.avi'].includes(fileExt)) {
      console.error('[upload-content] Invalid video format', { fileExt })
      return res.status(400).json({ 
        error: 'Invalid video format. Supported formats: MP4, WebM, MOV, AVI' 
      })
    }

    // Check if bucket exists but don't attempt to create it
    const bucketName = `secure-${contentType}-content`
    console.log('[upload-content] Checking if bucket exists', { bucketName })
    
    // Skip bucket creation, assume buckets are created manually in Supabase console
    console.log('[upload-content] Note: Buckets should be created manually in Supabase console')
    console.log('[upload-content] Reading file from disk', { filepath: file.filepath })
    
    // Read the file
    const fileBuffer = fs.readFileSync(file.filepath)
    console.log('[upload-content] File read successfully', { bufferSize: fileBuffer.length })
    
    let processedBuffer = fileBuffer
    const additionalData: { pageCount?: number, duration?: number } = {}
    
    // Process file based on type
    if (contentType === 'pdf') {
      console.log('[upload-content] Processing PDF file')
      
      try {
        // Process PDF - add simple watermark and get page count
        console.log('[upload-content] Loading PDF document')
        const pdfDoc = await PDFDocument.load(new Uint8Array(fileBuffer))
        
        const pages = pdfDoc.getPages()
        console.log('[upload-content] PDF loaded successfully', { pageCount: pages.length })
        
        // Embed font for watermark
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
        
        // Store page count
        additionalData.pageCount = pages.length
        
        // Add simple watermark to each page
        console.log('[upload-content] Adding watermarks to PDF pages')
        for (const page of pages) {
          const { width, height } = page.getSize()
          
          // Add a simple center watermark
          page.drawText("Arjuna's Arrow", {
            x: width / 2 - 100,
            y: height / 2,
            size: 50,
            font,
            color: rgb(0.9, 0.9, 0.9), // Light gray
            opacity: 0.3,
            rotate: degrees(45),
          });
        }
        
        // Save the modified PDF
        console.log('[upload-content] Saving watermarked PDF')
        const modifiedPdfBytes = await pdfDoc.save({
          useObjectStreams: false,
        })
        
        processedBuffer = Buffer.from(modifiedPdfBytes)
        console.log('[upload-content] PDF processed successfully with watermark')
      } catch (pdfError) {
        console.error('[upload-content] Error processing PDF:', pdfError)
        return res.status(500).json({ error: 'Failed to process PDF: ' + (pdfError as Error).message })
      }
    } else if (contentType === 'video') {
      console.log('[upload-content] Processing video file')
      
      try {
        // For video content, we'll try to get the duration
        if (['.mp4', '.webm', '.mov'].includes(fileExt)) {
          console.log('[upload-content] Attempting to extract video metadata')
          // For common formats, try using music-metadata
          try {
            const metadata = await parseBuffer(new Uint8Array(fileBuffer), { mimeType: `video/${fileExt.substring(1)}` })
            console.log('[upload-content] Video metadata extracted', { 
              format: metadata.format,
              duration: metadata.format?.duration 
            })
            
            if (metadata.format?.duration) {
              additionalData.duration = Math.round(metadata.format.duration)
            }
          } catch (metadataError) {
            console.error('[upload-content] Error extracting metadata with music-metadata:', metadataError)
          }
        }
        
        // If we couldn't get duration from metadata, try using ffprobe (if available)
        if (!additionalData.duration && ffprobeStatic) {
          console.log('[upload-content] Attempting to get duration with ffprobe')
          
          try {
            // Write temp file using toString for text file or Buffer conversion if needed
            const tempFilePath = path.join('/tmp', `temp-video-${uuidv4()}${fileExt}`)
            console.log('[upload-content] Writing video to temp file for ffprobe analysis', { tempFilePath })
            
            // Use Buffer correctly with fs.writeFileSync
            fs.writeFileSync(tempFilePath, new Uint8Array(fileBuffer))
            
            // Get duration using ffprobe
            console.log('[upload-content] Running ffprobe')
            const result = execSync(`${ffprobeStatic.path} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${tempFilePath}"`)
            const duration = parseFloat(result.toString().trim())
            
            console.log('[upload-content] ffprobe result', { 
              output: result.toString().trim(),
              parsedDuration: duration 
            })
            
            if (!isNaN(duration)) {
              additionalData.duration = Math.round(duration)
            }
            
            // Clean up temp file
            console.log('[upload-content] Removing temp file')
            fs.unlinkSync(tempFilePath)
          } catch (ffprobeErr) {
            console.error('[upload-content] Error getting video duration with ffprobe:', ffprobeErr)
          }
        }
      } catch (metadataErr) {
        console.error('[upload-content] Error in video processing:', metadataErr)
      }
    }
    
    // Generate a unique filename
    const uniqueId = uuidv4()
    const fileName = `${uniqueId}${fileExt}`
    const filePath = `${chapterId}/${fileName}`
    
    console.log('[upload-content] Prepared for upload', { 
      contentType,
      uniqueId,
      fileName,
      filePath,
      bucketName,
      additionalData
    })
    
    // Upload processed file to Supabase Storage
    console.log('[upload-content] Uploading to Supabase')
    
    try {
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(filePath, processedBuffer, {
          contentType: contentType === 'pdf' 
            ? 'application/pdf' 
            : `video/${fileExt.substring(1)}`,
          cacheControl: '3600'
        })
      
      console.log('[upload-content] Upload result', { 
        success: !uploadError,
        uploadData,
        error: uploadError ? uploadError.message : null
      })
      
      if (uploadError) {
        if (uploadError.message === 'Bucket not found') {
          console.error('[upload-content] Error: Bucket not found. Please create the bucket manually in Supabase console:', bucketName)
          return res.status(500).json({ 
            error: `Bucket "${bucketName}" not found. Please create it manually in the Supabase console with these settings:
            - Private access (not public)
            - File size limit: 500MB
            - Allowed MIME types: ${contentType === 'pdf' ? 'application/pdf' : 'video/mp4,video/webm,video/quicktime,video/x-msvideo'}`
          })
        } else {
          console.error('[upload-content] Error uploading file to Supabase:', uploadError)
          return res.status(500).json({ error: `Failed to upload file: ${uploadError.message}` })
        }
      }
      
      // For security, we'll serve files through a secure API endpoint
      // instead of giving direct access to the storage URL
      const secureFileUrl = `/api/content/serve-${contentType}?id=${uniqueId}&chapterId=${chapterId}`
      console.log('[upload-content] Created secure file URL', { secureFileUrl })
      
      // If the contentMetadata parameter is provided, automatically insert into the content table
      const title = Array.isArray(fields.title) 
        ? fields.title[0] 
        : (typeof fields.title === 'string' ? fields.title : '');
        
      const description = Array.isArray(fields.description) 
        ? fields.description[0] 
        : (typeof fields.description === 'string' ? fields.description : '');
      
      const orderNumber = Array.isArray(fields.orderNumber) ? parseInt(fields.orderNumber[0]) : 1;
      const isFree = Array.isArray(fields.isFree) ? fields.isFree[0] === 'true' : false;
      
      // Only insert into database if title is provided
      if (title) {
        try {
          console.log('[upload-content] Attempting to add content to database', { 
            title, 
            chapterId, 
            contentType,
            orderNumber,
            isFree
          });
          
          // First check if content with this chapter_id and order_number already exists
          const { data: existingContent } = await supabaseAdmin
            .from('content')
            .select('id, title')
            .eq('chapter_id', chapterId)
            .eq('order_number', orderNumber)
            .single();
            
          if (existingContent) {
            console.warn('[upload-content] Content with this chapter_id and order_number already exists', {
              existingId: existingContent.id,
              existingTitle: existingContent.title,
              orderNumber
            });
            
            // File was uploaded successfully, but content record wasn't inserted due to duplicate
            return res.status(409).json({
              data: {
                fileUrl: secureFileUrl,
                fileName: fileName,
                ...additionalData
              },
              warning: `File uploaded successfully, but content record wasn't inserted. A content item with order number ${orderNumber} already exists for this chapter. Please use a different order number.`
            });
          }
          
          // Insert the content
          const { data: contentData, error: contentError } = await supabaseAdmin
            .from('content')
            .insert({
              chapter_id: chapterId,
              title: title,
              description: description || null,
              content_type: contentType,
              file_url: secureFileUrl,
              duration: contentType === 'video' ? additionalData.duration || null : null,
              page_count: contentType === 'pdf' ? additionalData.pageCount || null : null,
              order_number: orderNumber,
              is_free: isFree
            })
            .select()
            .single();
            
          if (contentError) {
            console.error('[upload-content] Error inserting content record:', contentError);
            
            // If it's a unique constraint violation, return a specific error
            if (contentError.code === '23505' && contentError.message.includes('content_chapter_id_order_number_key')) {
              return res.status(409).json({
                data: {
                  fileUrl: secureFileUrl,
                  fileName: fileName,
                  ...additionalData
                },
                error: `A content item with order number ${orderNumber} already exists for this chapter. Please use a different order number.`
              });
            } else {
              // Other database error
              return res.status(500).json({
                data: {
                  fileUrl: secureFileUrl,
                  fileName: fileName,
                  ...additionalData
                },
                error: `File uploaded successfully, but failed to insert content record: ${contentError.message}`
              });
            }
          } else {
            console.log('[upload-content] Content record inserted successfully', { id: contentData.id });
            console.log('[upload-content] Request completed successfully');
            return res.status(200).json({
              data: {
                fileUrl: secureFileUrl,
                fileName: fileName,
                contentId: contentData.id,
                ...additionalData
              },
              message: 'File uploaded and content added successfully'
            });
          }
        } catch (dbError) {
          console.error('[upload-content] Exception during content insertion:', dbError);
          // Continue with a partial success (file uploaded but content not inserted)
          return res.status(500).json({
            data: {
              fileUrl: secureFileUrl,
              fileName: fileName,
              ...additionalData
            },
            error: `File uploaded successfully, but an error occurred while adding to database: ${(dbError as Error).message}`
          });
        }
      }
      
      // If no title provided, just return the file URL
      console.log('[upload-content] Request completed successfully - file only (no content record)');
      return res.status(200).json({ 
        data: {
          fileUrl: secureFileUrl,
          fileName: fileName,
          ...additionalData
        },
        message: 'File uploaded successfully (content not added to database - no title provided)'
      });
    } catch (uploadException) {
      console.error('[upload-content] Exception during upload:', uploadException)
      return res.status(500).json({ error: `Upload failed: ${(uploadException as Error).message}` })
    }
  } catch (error: unknown) {
    const err = error as Error & { 
      statusCode?: number;
      details?: string;
    }
    
    console.error('[upload-content] Unhandled exception:')
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