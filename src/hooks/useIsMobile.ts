import { useState, useEffect } from 'react';

interface MobileDetection {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
}

export const useIsMobile = (): MobileDetection => {
  const [detection, setDetection] = useState<MobileDetection>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 0,
  });

  useEffect(() => {
    const detectDevice = () => {
      const screenWidth = window.innerWidth;
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Check for mobile user agents
      const mobileUserAgents = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i;
      const tabletUserAgents = /ipad|android(?!.*mobile)|tablet/i;
      
      const isMobileUserAgent = mobileUserAgents.test(userAgent);
      const isTabletUserAgent = tabletUserAgents.test(userAgent);
      
      // Screen size breakpoints
      const isMobileScreen = screenWidth <= 768;
      const isTabletScreen = screenWidth > 768 && screenWidth <= 1024;
      const isDesktopScreen = screenWidth > 1024;
      
      // Combine user agent and screen size detection
      const isMobile = isMobileUserAgent || (isMobileScreen && !isTabletUserAgent);
      const isTablet = isTabletUserAgent || (isTabletScreen && !isMobileUserAgent);
      const isDesktop = !isMobile && !isTablet && isDesktopScreen;
      
      setDetection({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth,
      });
    };

    // Initial detection
    detectDevice();

    // Listen for resize events
    window.addEventListener('resize', detectDevice);
    
    // Listen for orientation changes on mobile
    window.addEventListener('orientationchange', () => {
      // Delay to allow orientation change to complete
      setTimeout(detectDevice, 100);
    });

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  return detection;
}; 