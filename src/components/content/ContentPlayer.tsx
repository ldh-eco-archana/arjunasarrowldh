import React, { useState, useEffect, useRef, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { styled } from '@mui/material/styles'
import { Content } from '@/types/database.types'

// Styled object for PDF viewing with controlled dimensions
const SecurePdfObject = styled('object')`
  width: 100%;
  height: 70vh;
  border: 1px solid ${props => props.theme.palette.divider};
  border-radius: ${props => props.theme.shape.borderRadius}px;
  max-width: 100%;
  overflow: auto !important; /* Force scrollable */
  position: relative; /* For overlay positioning */
  touch-action: pan-y pan-x !important; /* Enable both vertical and horizontal touch scrolling */
  -webkit-overflow-scrolling: touch; /* Enable momentum scrolling on iOS */
  -webkit-user-select: none; /* Prevent selection */
  object-fit: contain !important; /* Prevent stretching in landscape */
  aspect-ratio: auto !important; /* Maintain aspect ratio */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0,0,0,0.2);
    border-radius: 4px;
  }
`

// Iframe fallback for browsers that don't support PDF objects
const SecurePdfIframe = styled('iframe')`
  width: 100%;
  height: 70vh;
  border: 1px solid ${props => props.theme.palette.divider};
  border-radius: ${props => props.theme.shape.borderRadius}px;
  max-width: 100%;
  overflow: auto !important;
  position: relative;
  touch-action: pan-y pan-x !important;
  -webkit-overflow-scrolling: touch;
  -webkit-user-select: none;
  object-fit: contain !important;
  aspect-ratio: auto !important;
`

// Security overlay to prevent screenshots and direct interaction
const SecurityOverlay = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none !important; /* Never block PDF interaction */
  background: transparent; /* Fully transparent */
  z-index: 10;
  user-select: none;
  cursor: default;
  touch-action: none; /* Don't handle touch actions */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: transparent;
    pointer-events: none;
  }
  /* Only stop propagation for right-clicks */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 40px; /* Just cover the right edge */
    height: 100%;
    background: transparent;
    pointer-events: auto; /* Only block right-clicks on the edge */
    @media (max-width: 600px) {
      width: 20px; /* Smaller touch area on mobile */
    }
  }
`

// PDF interaction layer to handle scroll/navigation events but block right clicks
const InteractionLayer = styled('div')`
  position: absolute;
  top: 40px; /* Below header */
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 15;
  background: transparent;
  pointer-events: none; /* Don't block interaction with PDF */
  touch-action: auto; /* Allow touch scrolling */
  /* Only enable interaction for right-clicks */
  &:contextmenu {
    pointer-events: auto;
  }
`

// PDF container for right-click prevention
const SecurePdfContainer = styled('div')`
  position: relative;
  width: 100%;
  user-select: none; /* Prevent text selection */
  -webkit-touch-callout: none; /* Prevent callout to copy image on iOS */
  -webkit-user-select: none; /* Prevent selection on Safari */
  -khtml-user-select: none; /* Prevent selection on old browsers */
  -moz-user-select: none; /* Prevent selection on Firefox */
  -ms-user-select: none; /* Prevent selection on IE/Edge */
  touch-action: pan-y pan-x; /* Enable both vertical and horizontal touch scrolling */
  @media (orientation: landscape) {
    max-height: 90vh; /* Prevent overflow in landscape mode */
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
}

// Component to display content (PDF or video)
const ContentPlayer: React.FC<ContentPlayerProps> = ({ 
  content, 
  onError,
  onProgress 
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [useBlobUrl, setUseBlobUrl] = useState(false)
  const [useFallbackViewer, setUseFallbackViewer] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pdfContainerRef = useRef<HTMLDivElement>(null)
  const pdfObjectRef = useRef<HTMLObjectElement>(null)
  const pdfIframeRef = useRef<HTMLIFrameElement>(null)
  const interactionLayerRef = useRef<HTMLDivElement>(null)

  // Function to handle errors
  const handleError = useCallback((errorMsg: string): void => {
    setError(errorMsg)
    setLoading(false)
    if (onError) onError(errorMsg)
  }, [onError]);

  // Function to prevent printing, saving or capturing
  const preventActions = (e: React.MouseEvent<HTMLDivElement> | KeyboardEvent): boolean => {
    // Allow wheel events (used by touchpad) to pass through
    if (e.type === 'wheel') return true;
    
    // Continue to block context menu and other unwanted events
    e.preventDefault()
    e.stopPropagation()
    return false
  }

  // Initialize keyboard event listeners to prevent print via keyboard shortcuts
  useEffect(() => {
    if (content.content_type === 'pdf') {
      const handleKeyDown = (e: KeyboardEvent): boolean => {
        // Prevent Ctrl+P, Ctrl+S, Ctrl+Shift+P, F12
        if ((e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'P' || e.key === 'S')) || 
            (e.ctrlKey && e.shiftKey && (e.key === 'p' || e.key === 'P')) ||
            e.key === 'F12' || e.key === 'PrintScreen') {
          e.preventDefault()
          e.stopPropagation()
          return false
        }
        return true
      }
      
      // Add global event listeners
      window.addEventListener('keydown', handleKeyDown, true)
      window.addEventListener('contextmenu', preventActions as unknown as EventListener, true)
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown, true)
        window.removeEventListener('contextmenu', preventActions as unknown as EventListener, true)
      }
    }
  }, [content.content_type])

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
      // PDF handling is simpler as it's served through an iframe
      setLoading(false)
    }

    // Register progress update
    if (onProgress) {
      onProgress()
    }

    // Clean up any refresh timers on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
      
      // Clean up blob URL
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    }
  }, [content.file_url, content.content_type, refreshVideoUrl, onProgress, blobUrl]);

  // Special handling for touchpad/wheel scrolling in PDF
  useEffect(() => {
    if (content.content_type === 'pdf' && pdfObjectRef.current) {
      // Function to handle wheel events (touchpad scrolling)
      const handleWheel = (event: WheelEvent): boolean => {
        // Allow wheel events to pass through
        event.stopPropagation();
        
        // This allows the default browser behavior for scrolling
        return true;
      };

      // Get the PDF object DOM element
      const pdfElement = pdfObjectRef.current;
      
      // Add wheel event listener with passive option for better performance
      pdfElement.addEventListener('wheel', handleWheel, { passive: true });
      
      // Clean up
      return () => {
        pdfElement.removeEventListener('wheel', handleWheel);
      };
    }
  }, [content.content_type]);

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

  // Detect problematic browsers on mount
  useEffect(() => {
    if (content.content_type === 'pdf') {
      const userAgent = navigator.userAgent.toLowerCase();
      const isSamsung = userAgent.includes('samsung') || userAgent.includes('sm-');
      const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);
      
      // Enable fallback viewer for Samsung devices or if it's a mobile device
      if (isSamsung || isMobile) {
        setUseFallbackViewer(true);
      }
    }
  }, [content.content_type]);

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

  // Render PDF content
  if (content.content_type === 'pdf') {
    return (
      <Box sx={{ width: '100%', overflow: 'hidden' }}>
        <SecurePdfContainer 
          ref={pdfContainerRef}
          onContextMenu={preventActions}
          onDragStart={preventActions}
        >
          {useFallbackViewer ? (
            <SecurePdfIframe
              ref={pdfIframeRef}
              src={`${content.file_url}#toolbar=0&navpanes=0&scrollbar=1&statusbar=0&messages=0&scrolling=1&view=FitH`}
              title={content.title}
              sandbox="allow-scripts allow-same-origin"
              onLoad={() => setLoading(false)}
            />
          ) : (
            <SecurePdfObject
              ref={pdfObjectRef}
              data={`${content.file_url}#toolbar=0&navpanes=0&scrollbar=1&statusbar=0&messages=0&scrolling=1&view=FitH`}
              type="application/pdf"
              onLoad={() => setLoading(false)}
            >
              <Typography color="error">
                Your browser doesn&apos;t support embedded PDFs. <br/>
                <Box sx={{ mt: 1, textAlign: 'center' }}>
                  <Typography 
                    component="button" 
                    variant="body2" 
                    onClick={() => setUseFallbackViewer(true)}
                    sx={{ 
                      cursor: 'pointer', 
                      color: 'primary.main',
                      textDecoration: 'underline',
                      background: 'none',
                      border: 'none',
                      p: 1
                    }}
                  >
                    Click here to try alternative viewer
                  </Typography>
                </Box>
              </Typography>
            </SecurePdfObject>
          )}
          
          <InteractionLayer 
            ref={interactionLayerRef}
            onContextMenu={preventActions} 
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => e.button === 2 && e.preventDefault()}
            style={{ pointerEvents: useFallbackViewer ? 'none' : 'auto' }}
          />
          
          <SecurityOverlay />
          
          <Box 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '40px',
              background: theme => theme.palette.background.paper,
              borderBottom: theme => `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20,
            }}
          >
            <Typography variant="subtitle2">
              {content.title} - For educational use only
            </Typography>
          </Box>
        </SecurePdfContainer>
        
        <Box sx={{ 
          mt: 2, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1
        }}>
          <Typography variant="caption" color="text.secondary">
            {content.page_count} {content.page_count === 1 ? 'page' : 'pages'}
          </Typography>
          <Typography variant="caption" fontWeight="bold" color="error.main">
            For educational use only. No printing or download allowed.
          </Typography>
          {useFallbackViewer && (
            <Typography variant="caption" color="primary.main" sx={{ cursor: 'pointer' }} onClick={() => setUseFallbackViewer(false)}>
              Try standard viewer
            </Typography>
          )}
        </Box>
      </Box>
    )
  }

  // Render video content
  if (content.content_type === 'video') {
    return (
      <Box sx={{ width: '100%' }}>
        <SecureVideoElement
          ref={videoRef}
          src={useBlobUrl ? blobUrl || '' : videoUrl}
          controls
          autoPlay={false}
          controlsList="nodownload"
          preload="auto"
          crossOrigin="anonymous"
          onContextMenu={(e: React.MouseEvent<HTMLVideoElement>) => e.preventDefault()}
          onError={() => {
            console.error('[ContentPlayer] Video error event');
            
            // Log more detailed error information
            if (videoRef.current) {
              const video = videoRef.current;
              console.error('[ContentPlayer] Video error details:', {
                error: video.error ? {
                  code: video.error.code,
                  message: video.error.message
                } : 'No error object',
                networkState: video.networkState,
                readyState: video.readyState
              });
            }
            
            handleVideoError();
          }}
          playsInline
        />
        
        <Box sx={{ 
          mt: 2, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1
        }}>
          <Typography variant="caption" color="text.secondary">
            {content.duration ? `Duration: ${Math.floor(content.duration / 60)}m ${content.duration % 60}s` : ''}
          </Typography>
          <Typography variant="caption" fontWeight="bold" color="error.main">
            For educational use only. This video cannot be downloaded.
          </Typography>
        </Box>
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