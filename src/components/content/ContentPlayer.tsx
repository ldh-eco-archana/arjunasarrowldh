import React, { useState, useEffect, useRef, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { styled } from '@mui/material/styles'
import { Content } from '@/types/database.types'
import dynamic from 'next/dynamic'

// Dynamically import the PDF viewer to avoid SSR issues
const PDFViewer = dynamic(() => import('@/components/content/PDFViewer'), {
  ssr: false,
  loading: () => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      height: '70vh',
      flexDirection: 'column',
      gap: 2
    }}>
      <CircularProgress />
      <Typography>Loading PDF viewer...</Typography>
    </Box>
  )
})

// Container for PDF content
const PdfContainer = styled('div')`
  position: relative;
  width: 100%;
  height: 70vh;
  
  @media (max-width: 768px) {
    height: 65vh;
  }
  
  @media (orientation: landscape) and (max-width: 900px) {
    height: 85vh;
  }
`

// Styled video element
const SecureVideoElement = styled('video')`
  width: 100%;
  max-height: 70vh;
  border-radius: ${props => props.theme.shape.borderRadius}px;
  background-color: black;
`

interface ContentPlayerProps {
  content: Content
  onError?: (error: string) => void
  onProgress?: () => void
  onReady?: () => void
}

// Component to display content (PDF or video)
const ContentPlayer: React.FC<ContentPlayerProps> = ({ 
  content, 
  onError,
  onProgress,
  onReady
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [useBlobUrl, setUseBlobUrl] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Function to handle errors
  const handleError = useCallback((errorMsg: string): void => {
    setError(errorMsg)
    setLoading(false)
    if (onError) onError(errorMsg)
  }, [onError]);

  // Function to refresh video URL when it expires
  const refreshVideoUrl = useCallback(async (): Promise<void> => {
    try {
      console.log('[ContentPlayer] Refreshing video URL for content:', content.id);
      // Extract the ID and chapter ID from the file_url
      const urlParams = new URLSearchParams(content.file_url.split('?')[1])
      const id = urlParams.get('id')
      const chapterId = urlParams.get('chapterId')

      if (!id || !chapterId) {
        console.error('[ContentPlayer] Missing ID or chapterId in content URL:', content.file_url);
        handleError('Invalid content URL')
        return
      }

      const response = await fetch(`/api/content/serve-video?id=${id}&chapterId=${chapterId}`)
      
      if (!response.ok) {
        console.error('[ContentPlayer] API responded with error:', response.status, response.statusText);
        const errorData = await response.json()
        handleError(errorData.error || 'Failed to refresh video URL')
        return
      }

      const data = await response.json()
      const { url, expiresIn } = data
      
      setVideoUrl(url)
      setLoading(false)
      
      // Set timer to refresh URL before it expires (1 minute before expiry)
      const refreshTime = Math.max((expiresIn - 60) * 1000, 30000) // At least 30 seconds
      
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
      
      refreshTimerRef.current = setTimeout(refreshVideoUrl, refreshTime)
      
      // If we have a video reference and the video was playing, resume playback
      if (videoRef.current && !videoRef.current.paused) {
        const currentTime = videoRef.current.currentTime
        videoRef.current.src = url
        videoRef.current.currentTime = currentTime
        videoRef.current.play().catch(console.error)
      }
      
    } catch (err) {
      handleError('Error refreshing video URL')
      console.error('[ContentPlayer] Video refresh error:', err)
    }
  }, [content.id, content.file_url, handleError]);

  // Initialize content based on type
  useEffect(() => {
    setLoading(true)
    setError('')

    if (content.content_type === 'video') {
      refreshVideoUrl()
    } else {
      // PDF handling is simpler as it's served directly to the PDF viewer
      setLoading(false)
      if (onReady) {
        // Slight delay to allow PDF viewer to initialize
        setTimeout(() => {
          onReady()
        }, 500)
      }
    }

    // Register progress update
    if (onProgress) {
      onProgress()
    }
  }, [content.content_type, content.id, refreshVideoUrl, onProgress, onReady])

  // Handle video loaded
  const handleVideoLoaded = useCallback(() => {
    setLoading(false);
    if (onReady) {
      onReady();
    }
  }, [onReady]);

  // Function to fetch video as blob and create object URL
  const fetchVideoAsBlob = async (url: string): Promise<boolean> => {
    try {
      console.log('[ContentPlayer] Fetching video as blob');
      setLoading(true);
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        console.error('[ContentPlayer] Failed to fetch video blob:', response.status, response.statusText);
        return false;
      }
      
      const blob = await response.blob();
      console.log('[ContentPlayer] Video blob received:', { 
        size: Math.round(blob.size / 1024 / 1024 * 100) / 100 + ' MB',
        type: blob.type 
      });
      
      // Create blob URL
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      
      const newBlobUrl = URL.createObjectURL(blob);
      setBlobUrl(newBlobUrl);
      setUseBlobUrl(true);
      setLoading(false);
      
      return true;
    } catch (error) {
      console.error('[ContentPlayer] Error fetching video blob:', error);
      return false;
    }
  }

  // Try alternative method when direct URL fails
  const handleVideoError = (): void => {
    if (!useBlobUrl && videoUrl) {
      console.log('[ContentPlayer] Direct URL failed, trying blob approach');
      fetchVideoAsBlob(videoUrl).catch(error => {
        console.error('[ContentPlayer] Both video approaches failed:', error);
        handleError('Video failed to load. Please try again later.');
      });
    } else {
      handleError('Video failed to load. Please try again later.');
    }
  };

  // Content type-specific rendering
  if (loading && content.content_type === 'video') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  // Render PDF content with modern viewer
  if (content.content_type === 'pdf') {
    return (
      <PdfContainer>
        <PDFViewer fileUrl={content.file_url} title={content.title || "PDF Document"} />
      </PdfContainer>
    )
  }

  // Render video content
  if (content.content_type === 'video') {
    return (
      <Box 
        sx={{ width: '100%', position: 'relative' }}
        onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
      >
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {useBlobUrl && blobUrl ? (
          <SecureVideoElement
            ref={videoRef}
            src={blobUrl}
            controls
            playsInline
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
            onError={handleVideoError}
            onLoadedData={handleVideoLoaded}
            onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
          />
        ) : (
          <SecureVideoElement
            ref={videoRef}
            src={videoUrl}
            controls
            playsInline
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
            onError={handleVideoError}
            onLoadedData={handleVideoLoaded}
            onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
          />
        )}
      </Box>
    )
  }

  // Fallback for unsupported content types
  return (
    <Alert severity="warning">
      Unsupported content type: {content.content_type}
    </Alert>
  )
}

export default ContentPlayer 