import React, { useState, useEffect } from 'react';
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { LoadError } from '@react-pdf-viewer/core';

// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// Custom styles for the PDF viewer
const ViewerContainer = styled('div')`
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  
  /* Custom styles to hide unwanted UI elements */
  .rpv-core__viewer {
    --rpv-toolbar__height: 40px; /* Reduce toolbar height */
  }
  
  /* Hide print, download buttons */
  [data-testid="print"] {
    display: none !important;
  }
  [data-testid="download"] {
    display: none !important;
  }
  
  /* Hide right click related buttons */
  [data-testid="more-actions"] {
    display: none !important;
  }
  
  /* Mobile-specific styles */
  @media (max-width: 768px) {
    /* Increase hit areas for mobile buttons */
    .rpv-core__minimal-button {
      min-width: 40px !important;
      min-height: 40px !important;
    }
    
    /* Make zoom buttons more prominent */
    .rpv-core__minimal-button-icon {
      transform: scale(1.2);
    }
    
    /* Ensure toolbar text is readable */
    .rpv-core__minimal-button-text,
    .rpv-core__page-layer-current-page-input {
      font-size: 1rem !important;
    }
  }
`;

// Overlay to prevent right-clicking and touch events for saving
const SecurityOverlay = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  pointer-events: none; /* Allow interaction with PDF below */
  user-select: none;
  touch-action: none; /* Prevent default touch actions */
  
  /* When right-clicked or long-pressed, this becomes active */
  &.active {
    pointer-events: auto;
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

interface PDFViewerProps {
  fileUrl: string;
  title?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rightClickActive, setRightClickActive] = useState(false);
  
  // State to track if we're on a mobile device
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device on component mount
  useEffect(() => {
    const checkMobile = (): void => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Set up event listeners to prevent right-click and keyboard shortcuts
  useEffect(() => {
    // Handle right clicks on desktop
    const preventContextMenu = (e: MouseEvent): boolean => {
      e.preventDefault();
      setRightClickActive(true);
      // Reset after a short delay
      setTimeout(() => setRightClickActive(false), 300);
      return false;
    };
    
    // Handle long press on mobile (similar to right-click)
    const preventTouchHold = (e: TouchEvent): void => {
      if (e.touches.length === 1) {
        setRightClickActive(true);
        // Reset after touch end or a timeout
        setTimeout(() => setRightClickActive(false), 300);
      }
    };

    // Handle touch end
    const handleTouchEnd = (): void => {
      setRightClickActive(false);
    };

    // Prevent keyboard shortcuts
    const preventKeyboardShortcuts = (e: KeyboardEvent): boolean | undefined => {
      // Prevent ctrl+p, ctrl+s and other shortcuts
      if (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'P' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }
    };

    // Add global event listeners
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeyboardShortcuts);
    document.addEventListener('touchstart', preventTouchHold, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    // Clean up event listeners when component unmounts
    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventKeyboardShortcuts);
      document.removeEventListener('touchstart', preventTouchHold);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Create the plugin instance with customized toolbar
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [
      // Only show thumbnails in sidebar
      defaultTabs[0],
    ],
    renderToolbar: (Toolbar) => (
      <Toolbar>
        {(slots) => {
          const {
            CurrentPageInput,
            GoToNextPage,
            GoToPreviousPage,
            NumberOfPages,
            Zoom,
            ZoomIn,
            ZoomOut,
          } = slots;
          
          return (
            <div className="rpv-toolbar">
              <div className="rpv-toolbar__left">
                <div className="rpv-toolbar__item">
                  <GoToPreviousPage />
                </div>
                <div className="rpv-toolbar__item">
                  <CurrentPageInput /> / <NumberOfPages />
                </div>
                <div className="rpv-toolbar__item">
                  <GoToNextPage />
                </div>
              </div>
              <div className="rpv-toolbar__center">
                {/* Center area can be left empty or customized */}
              </div>
              <div className="rpv-toolbar__right">
                <div className="rpv-toolbar__item">
                  <ZoomOut />
                </div>
                <div className="rpv-toolbar__item">
                  <Zoom />
                </div>
                <div className="rpv-toolbar__item">
                  <ZoomIn />
                </div>
              </div>
            </div>
          );
        }}
      </Toolbar>
    ),
  });

  const handleDocumentLoad = (): void => {
    setLoading(false);
  };

  const handleError = (error: Error | LoadError): void => {
    console.error('Error loading PDF:', error);
    setError('Failed to load the PDF document. Please try again later.');
    setLoading(false);
  };

  return (
    <ViewerContainer>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading && (
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.8)',
            zIndex: 999,
            gap: 2
          }}
        >
          <CircularProgress />
          <Typography variant="body1">Loading document...</Typography>
        </Box>
      )}
      
      {/* Security overlay that becomes active on right click or long press */}
      <SecurityOverlay className={rightClickActive ? 'active' : ''} />
      
      <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
        <Viewer
          fileUrl={fileUrl}
          plugins={[defaultLayoutPluginInstance]}
          defaultScale={isMobile ? SpecialZoomLevel.PageWidth : SpecialZoomLevel.PageFit}
          onDocumentLoad={handleDocumentLoad}
          withCredentials={true}
          renderError={(error: LoadError) => {
            handleError(error);
            return (
              <Alert severity="error" sx={{ m: 2 }}>
                Failed to load the PDF document. Please try again later.
              </Alert>
            );
          }}
        />
      </Worker>
    </ViewerContainer>
  );
};

export default PDFViewer; 