import React, { useState, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Fab from '@mui/material/Fab';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import FitScreenIcon from '@mui/icons-material/FitScreen';

// Import the styles
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const ViewerContainer = styled('div')`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: #f5f5f5;
  
  /* Mobile-specific optimizations */
  @media (max-width: 768px) {
    height: 85vh;
    touch-action: pan-x pan-y pinch-zoom;
    -webkit-overflow-scrolling: touch;
  }
`;

const PageContainer = styled('div')<{ scale: number }>`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 16px;
  min-height: 100%;
  width: max-content;
  min-width: 100%;
  
  /* Smooth scrolling */
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  
  /* PDF page styling */
  .react-pdf__Page {
    margin-bottom: 16px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    border-radius: 4px;
    background: white;
    
    /* Mobile touch optimizations */
    @media (max-width: 768px) {
      margin-bottom: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  }
  
  .react-pdf__Page__canvas {
    max-width: none !important;
    height: auto !important;
    display: block;
    
    /* Enable pinch zoom on mobile */
    @media (max-width: 768px) {
      touch-action: pinch-zoom;
    }
  }
`;

const ControlsContainer = styled(Paper)`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  
  @media (max-width: 768px) {
    bottom: 16px;
    padding: 6px 12px;
    gap: 4px;
  }
`;

const MobileHint = styled(Box)`
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(33, 150, 243, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  z-index: 1000;
  backdrop-filter: blur(8px);
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const ZoomButton = styled(IconButton)`
  background-color: rgba(255, 255, 255, 0.9);
  color: #1976d2;
  width: 44px;
  height: 44px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 1);
  }
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

interface MobilePDFViewerProps {
  fileUrl: string;
  title?: string;
}

const MobilePDFViewer: React.FC<MobilePDFViewerProps> = ({ fileUrl, title }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialScaleSet, setInitialScaleSet] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Handle container resize
  useEffect(() => {
    const updateWidth = (): void => {
      const container = document.getElementById('pdf-container');
      if (container) {
        const width = container.clientWidth - 32; // Account for padding
        setContainerWidth(width);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }, []);

  // Ensure currentPage is always valid
  useEffect(() => {
    if (numPages > 0 && currentPage > numPages) {
      setCurrentPage(numPages);
    } else if (numPages > 0 && currentPage < 1) {
      setCurrentPage(1);
    }
  }, [numPages, currentPage]);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF document. Please try again.');
    setLoading(false);
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale(prev => {
      const newScale = prev + 0.25;
      const maxScale = 3.0;
      const finalScale = newScale <= maxScale ? newScale : maxScale;
      console.log('Zoom in: from', prev, 'to', finalScale);
      return finalScale;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => {
      const newScale = prev - 0.25;
      const minScale = 0.5;
      const finalScale = newScale >= minScale ? newScale : minScale;
      console.log('Zoom out: from', prev, 'to', finalScale);
      return finalScale;
    });
  }, []);

  const handleFitToWidth = useCallback(() => {
    if (containerWidth > 0) {
      // Calculate fit-to-width scale based on current container width
      const estimatedPdfWidth = 600; // Standard PDF width
      const fitScale = Math.min(containerWidth / estimatedPdfWidth, 1.0);
      const newScale = Math.max(fitScale, 0.5); // Don't go below 50%
      console.log('Fit to width: setting scale to', newScale);
      setScale(newScale);
    } else {
      console.log('Fit to width: resetting scale to 1.0');
      setScale(1.0);
    }
  }, [containerWidth]);

  const onPageLoadSuccess = useCallback((page: any) => {
    if (!initialScaleSet && containerWidth > 0) {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        const pageWidth = page.width;
        const availableWidth = containerWidth;
        const fitScale = Math.min(availableWidth / pageWidth, 1.0);
        const initialScale = Math.max(fitScale, 0.5); // Don't go below 50%
        console.log('Setting mobile fit-to-width scale:', initialScale, 'pageWidth:', pageWidth, 'availableWidth:', availableWidth);
        setScale(initialScale);
      }
      setInitialScaleSet(true);
    }
  }, [initialScaleSet, containerWidth]);

  const goToPrevPage = useCallback(() => {
    console.log('goToPrevPage called, currentPage:', currentPage, 'numPages:', numPages);
    setCurrentPage(prev => {
      const newPage = prev - 1;
      const validPage = newPage >= 1 ? newPage : 1;
      console.log('Setting page from', prev, 'to', validPage);
      return validPage;
    });
  }, [currentPage, numPages]);

  const goToNextPage = useCallback(() => {
    console.log('goToNextPage called, currentPage:', currentPage, 'numPages:', numPages);
    setCurrentPage(prev => {
      if (numPages === 0) {
        console.log('numPages is 0, not changing page');
        return prev;
      }
      const newPage = prev + 1;
      const validPage = newPage <= numPages ? newPage : numPages;
      console.log('Setting page from', prev, 'to', validPage);
      return validPage;
    });
  }, [currentPage, numPages]);

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <ViewerContainer>
      {/* Loading indicator */}
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
          <CircularProgress size={60} />
          <Typography variant="h6">Loading PDF...</Typography>
        </Box>
      )}

      {/* PDF Document */}
      <PageContainer scale={scale} id="pdf-container">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
        >
          <Page
            pageNumber={Math.max(1, Math.min(currentPage, numPages || 1))}
            scale={scale}
            loading={null}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            onLoadSuccess={onPageLoadSuccess}
          />
        </Document>
      </PageContainer>

      {/* Controls */}
      {!loading && numPages > 0 && (
        <ControlsContainer elevation={3}>
          {/* Navigation */}
          <ZoomButton 
            onClick={goToPrevPage} 
            disabled={currentPage <= 1 || loading}
            size="small"
          >
            <NavigateBeforeIcon />
          </ZoomButton>
          
          <Typography variant="body2" sx={{ minWidth: '60px', textAlign: 'center' }}>
            {currentPage} / {numPages}
          </Typography>
          
          <ZoomButton 
            onClick={goToNextPage} 
            disabled={currentPage >= numPages || numPages === 0 || loading}
            size="small"
          >
            <NavigateNextIcon />
          </ZoomButton>

          {/* Divider */}
          <Box sx={{ width: '1px', height: '24px', backgroundColor: '#ddd', mx: 1 }} />

          {/* Zoom controls */}
          <ZoomButton onClick={handleZoomOut} disabled={scale <= 0.5} size="small">
            <ZoomOutIcon />
          </ZoomButton>
          
          <Typography variant="body2" sx={{ minWidth: '50px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </Typography>
          
          <ZoomButton onClick={handleZoomIn} disabled={scale >= 3.0} size="small">
            <ZoomInIcon />
          </ZoomButton>
          
          <ZoomButton onClick={handleFitToWidth} size="small" title="Fit to screen width">
            <FitScreenIcon />
          </ZoomButton>
        </ControlsContainer>
      )}
    </ViewerContainer>
  );
};

export default MobilePDFViewer; 