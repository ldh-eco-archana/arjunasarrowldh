'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';

interface MobilePDFViewerProps {
  fileUrl: string;
  title?: string;
  onContentReady?: () => void;
}

const MobilePDFViewer: React.FC<MobilePDFViewerProps> = ({ fileUrl, onContentReady }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create plugin instances
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const zoomPluginInstance = zoomPlugin();
  
  const { CurrentPageInput, GoToNextPage, GoToPreviousPage } = pageNavigationPluginInstance;
  const { ZoomIn, ZoomOut, Zoom } = zoomPluginInstance;

  useEffect(() => {
    // Reset state when fileUrl changes
    setError(null);
    setLoading(true);
  }, [fileUrl]);

  const handleDocumentLoad = (): void => {
    setLoading(false);
    if (onContentReady) {
      onContentReady();
    }
  };


  // Disable right-click and keyboard shortcuts
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent): boolean => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent): void => {
      // Disable Ctrl+P (print) and Ctrl+S (save)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) {
        e.preventDefault();
      }
    };

    // Override window.print
    const originalPrint = window.print;
    window.print = () => {
      // Do nothing - printing is disabled
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      window.print = originalPrint;
    };
  }, []);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = (): void => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        '& .rpv-core__viewer': {
          '--scale-factor': '1',
        },
      }}
    >
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CircularProgress size={40} sx={{ color: '#4c51bf' }} />
          <Typography variant="body2" color="text.secondary">
            Loading PDF...
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {!error && fileUrl && (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Viewer
              fileUrl={fileUrl}
              defaultScale={SpecialZoomLevel.PageWidth}
              plugins={[pageNavigationPluginInstance, zoomPluginInstance]}
              onDocumentLoad={handleDocumentLoad}
            />
          </Box>
          
          {/* Navigation Controls */}
          {!loading && !error && (
            <Box
              sx={{
                position: 'sticky',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'white',
                borderTop: '1px solid rgba(0, 0, 0, 0.12)',
                p: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                zIndex: 10,
              }}
            >
              {/* Navigation row */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: 2 
              }}>
                <GoToPreviousPage>
                  {(props: any) => (
                    <IconButton
                      onClick={props.onClick}
                      disabled={props.isDisabled}
                      sx={{
                        backgroundColor: 'rgba(76, 81, 191, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 81, 191, 0.2)',
                        },
                        '&:disabled': {
                          backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        },
                      }}
                    >
                      <NavigateBeforeIcon />
                    </IconButton>
                  )}
                </GoToPreviousPage>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">Page</Typography>
                  <CurrentPageInput />
                </Box>

                <GoToNextPage>
                  {(props: any) => (
                    <IconButton
                      onClick={props.onClick}
                      disabled={props.isDisabled}
                      sx={{
                        backgroundColor: 'rgba(76, 81, 191, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 81, 191, 0.2)',
                        },
                        '&:disabled': {
                          backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        },
                      }}
                    >
                      <NavigateNextIcon />
                    </IconButton>
                  )}
                </GoToNextPage>

                {/* Fullscreen button */}
                <IconButton
                  onClick={() => {
                    if (!document.fullscreenElement && containerRef.current) {
                      containerRef.current.requestFullscreen();
                    } else if (document.exitFullscreen) {
                      document.exitFullscreen();
                    }
                  }}
                  sx={{
                    backgroundColor: 'rgba(76, 81, 191, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(76, 81, 191, 0.2)',
                    },
                  }}
                >
                  {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Box>

              {/* Zoom controls row */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 2,
                pb: 1
              }}>
                <ZoomOut>
                  {(props: any) => (
                    <IconButton
                      onClick={props.onClick}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(76, 81, 191, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 81, 191, 0.2)',
                        },
                      }}
                    >
                      <ZoomOutIcon fontSize="small" />
                    </IconButton>
                  )}
                </ZoomOut>
                
                <Zoom />
                
                <ZoomIn>
                  {(props: any) => (
                    <IconButton
                      onClick={props.onClick}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(76, 81, 191, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 81, 191, 0.2)',
                        },
                      }}
                    >
                      <ZoomInIcon fontSize="small" />
                    </IconButton>
                  )}
                </ZoomIn>
              </Box>
            </Box>
          )}
        </Worker>
      )}
    </Box>
  );
};

export default MobilePDFViewer;