import React, { useEffect, useRef, useState, useCallback } from 'react'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import { styled } from '@mui/material/styles'
import dynamic from 'next/dynamic'

// Dynamically import react-player to avoid SSR issues
const ReactPlayer = dynamic(() => import('react-player/lazy'), {
  ssr: false,
})

// Styled components for security overlay
const VideoContainer = styled(Box)`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #000;
  overflow: hidden;
  
  @media (max-width: 768px) {
    aspect-ratio: 16 / 10;
  }
`

const SecurityOverlay = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`

const Watermark = styled('div')`
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.7);
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  border-radius: 4px;
  z-index: 3;
  pointer-events: none;
  user-select: none;
  font-family: monospace;
  
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 6px 12px;
    top: 10px;
    right: 10px;
  }
`

const FloatingWatermark = styled('div')`
  position: absolute;
  color: rgba(255, 255, 255, 0.3);
  font-size: 18px;
  z-index: 3;
  pointer-events: none;
  user-select: none;
  animation: float 20s infinite linear;
  
  @keyframes float {
    0% {
      transform: translate(0, 0);
    }
    25% {
      transform: translate(100px, 50px);
    }
    50% {
      transform: translate(-50px, 100px);
    }
    75% {
      transform: translate(50px, -50px);
    }
    100% {
      transform: translate(0, 0);
    }
  }
`

interface SecureVideoPlayerProps {
  url: string
  onError?: (error: string) => void
  onReady?: () => void
  userEmail?: string
}

const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({
  url,
  onError,
  onReady,
  userEmail = 'Protected Content'
}) => {
  const [playing, setPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [_isFullscreen, setIsFullscreen] = useState(false)
  const [watermarkPosition, setWatermarkPosition] = useState({ top: '50%', left: '50%' })
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Disable right-click context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent): boolean => {
      e.preventDefault()
      return false
    }

    const handleKeyDown = (e: KeyboardEvent): boolean => {
      // Prevent common screenshot shortcuts
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) || // Ctrl+Shift+S
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) || // Mac screenshot
        (e.key === 'PrintScreen')
      ) {
        e.preventDefault()
        console.warn('Screenshot attempt blocked')
        return false
      }
      return true
    }

    // Detect fullscreen changes
    const handleFullscreenChange = (): void => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    // Randomly move floating watermark
    const watermarkInterval = setInterval(() => {
      setWatermarkPosition({
        top: `${Math.random() * 70 + 15}%`,
        left: `${Math.random() * 70 + 15}%`
      })
    }, 5000)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
      clearInterval(watermarkInterval)
    }
  }, [])

  // Detect developer tools (basic detection)
  useEffect(() => {
    const detectDevTools = (): void => {
      const threshold = 160
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold
      
      if (widthThreshold || heightThreshold) {
        console.warn('Developer tools detected')
        // You could pause the video or show a warning here
      }
    }

    const interval = setInterval(detectDevTools, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleError = useCallback((error: any) => {
    console.error('Video playback error:', error)
    
    // More specific error handling
    let errorMessage = 'Failed to load video. Please try again.'
    
    if (error?.type === 'hlsError' || error?.target?.error?.code === 4) {
      errorMessage = 'This video format is not supported in your browser. Please try a different browser or contact support.'
    } else if (error?.target?.error?.code === 2) {
      errorMessage = 'Network error while loading video. Please check your connection.'
    } else if (error?.target?.error?.code === 3) {
      errorMessage = 'Video decoding error. Please try refreshing the page.'
    }
    
    setHasError(true)
    if (onError) {
      onError(errorMessage)
    }
  }, [onError])

  const handleReady = useCallback(() => {
    if (onReady) {
      onReady()
    }
  }, [onReady])

  // Custom config for react-player
  const playerConfig = {
    file: {
      attributes: {
        controlsList: 'nodownload noremoteplayback',
        disablePictureInPicture: true,
        onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
        crossOrigin: 'anonymous',
      },
      forceVideo: true,
      hlsOptions: {
        // HLS.js options for better compatibility
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        maxBufferSize: 60 * 1000 * 1000, // 60 MB
        maxBufferHole: 0.5,
        lowLatencyMode: false,
        // Fallback for unsupported formats
        xhrSetup: (xhr: XMLHttpRequest) => {
          xhr.setRequestHeader('Cache-Control', 'no-cache')
        }
      }
    }
  }

  if (hasError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Unable to load video. Please check your connection and try again.
      </Alert>
    )
  }

  return (
    <VideoContainer ref={containerRef}>
      <SecurityOverlay />
      
      {/* Fixed watermark */}
      <Watermark>
        {userEmail} • {new Date().toLocaleDateString()}
      </Watermark>
      
      {/* Floating watermark for extra security */}
      <FloatingWatermark style={watermarkPosition}>
        Protected Content
      </FloatingWatermark>
      
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={playing}
        controls
        width="100%"
        height="100%"
        config={playerConfig}
        onError={handleError}
        onReady={handleReady}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        progressInterval={5000}
        pip={false}
        stopOnUnmount
        playsinline
        style={{ pointerEvents: 'auto' }}
      />
      
      {/* Overlay that only covers non-control areas */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: '50px', // Leave space for controls
          zIndex: 1,
          pointerEvents: playing ? 'none' : 'auto',
        }}
        onContextMenu={(e) => e.preventDefault()}
        onClick={() => setPlaying(!playing)}
      />
    </VideoContainer>
  )
}

export default SecureVideoPlayer