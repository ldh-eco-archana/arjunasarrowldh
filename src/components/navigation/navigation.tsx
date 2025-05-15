import React, { FC } from 'react'
import Box from '@mui/material/Box'
import { Link as ScrollLink } from 'react-scroll'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { navigations } from './navigation.data'
import LogoutIcon from '@mui/icons-material/Logout'
import Button from '@mui/material/Button'
import { createClient } from '@/utils/supabase/client'

interface NavigationProps {
  isMobile?: boolean;
  onCloseMenu?: () => void;
}

const Navigation: FC<NavigationProps> = ({ isMobile, onCloseMenu }) => {
  const router = useRouter();
  const isELearningRelatedPage = 
    router.pathname === '/e-learning-portal' || 
    router.pathname === '/login' || 
    router.pathname === '/signup' || 
    router.pathname === '/payment';
  
  // Check if we're on any authenticated user page (dashboard, profile, change-password)
  const isAuthenticatedUserPage = 
    router.pathname === '/dashboard' || 
    router.pathname === '/profile' || 
    router.pathname === '/change-password';
  
  const handleLinkClick = (): void => {
    if (isMobile && onCloseMenu) {
      onCloseMenu();
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      // Close menu if on mobile
      if (isMobile && onCloseMenu) {
        onCloseMenu();
      }
      
      // Use the new Supabase client
      const supabase = createClient()
      await supabase.auth.signOut()
      
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navBoxStyles = {
    display: 'flex', 
    flexDirection: { xs: 'column', md: 'row' },
    alignItems: 'center',
    width: isMobile ? '100%' : 'auto',
    mt: isMobile ? 2 : 0,
    gap: isMobile ? 3 : 0
  };
  
  // If on dashboard, profile, or change password, only show these navigation links
  if (isAuthenticatedUserPage) {
    return (
      <Box sx={navBoxStyles}>
        <Link href="/dashboard" passHref>
          <Box
            component="a"
            sx={{
              position: 'relative',
              color: router.pathname === '/dashboard' ? 'primary.main' : 'text.disabled',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: { xs: 0, md: 3 },
              mb: { xs: 3, md: 0 },
              fontSize: { xs: '1.2rem', md: 'inherit' },
              textDecoration: 'none',
              '& > div': { display: 'none' },
              '&:hover': {
                color: 'primary.main',
                '&>div': {
                  display: 'block',
                },
              },
            }}
            onClick={handleLinkClick}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                transform: 'rotate(3deg)',
                '& img': { width: 44, height: 'auto' },
                display: router.pathname === '/dashboard' ? 'block' : 'none',
              }}
            >
              {/* eslint-disable-next-line */}
              <img src="/images/headline-curve.svg" alt="Headline curve" />
            </Box>
            Dashboard
          </Box>
        </Link>
        
        <Link href="/profile" passHref>
          <Box
            component="a"
            sx={{
              position: 'relative',
              color: router.pathname === '/profile' ? 'primary.main' : 'text.disabled',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: { xs: 0, md: 3 },
              mb: { xs: 3, md: 0 },
              fontSize: { xs: '1.2rem', md: 'inherit' },
              textDecoration: 'none',
              '& > div': { display: 'none' },
              '&:hover': {
                color: 'primary.main',
                '&>div': {
                  display: 'block',
                },
              },
            }}
            onClick={handleLinkClick}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                transform: 'rotate(3deg)',
                '& img': { width: 44, height: 'auto' },
                display: router.pathname === '/profile' ? 'block' : 'none',
              }}
            >
              {/* eslint-disable-next-line */}
              <img src="/images/headline-curve.svg" alt="Headline curve" />
            </Box>
            My Profile
          </Box>
        </Link>
        
        <Link href="/change-password" passHref>
          <Box
            component="a"
            sx={{
              position: 'relative',
              color: router.pathname === '/change-password' ? 'primary.main' : 'text.disabled',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: { xs: 0, md: 3 },
              mb: { xs: 3, md: 0 },
              fontSize: { xs: '1.2rem', md: 'inherit' },
              textDecoration: 'none',
              '& > div': { display: 'none' },
              '&:hover': {
                color: 'primary.main',
                '&>div': {
                  display: 'block',
                },
              },
            }}
            onClick={handleLinkClick}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                transform: 'rotate(3deg)',
                '& img': { width: 44, height: 'auto' },
                display: router.pathname === '/change-password' ? 'block' : 'none',
              }}
            >
              {/* eslint-disable-next-line */}
              <img src="/images/headline-curve.svg" alt="Headline curve" />
            </Box>
            Change Password
          </Box>
        </Link>
        
        <Button
          variant="text"
          color="primary"
          startIcon={<LogoutIcon />}
          onClick={handleSignOut}
          sx={{
            ml: { xs: 0, md: 2 },
            mt: { xs: 1, md: 0 },
            whiteSpace: 'nowrap',
            fontWeight: 600,
            fontSize: { xs: '1.2rem', md: 'inherit' },
          }}
        >
          Sign Out
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={navBoxStyles}>
      {navigations.map(({ path: destination, label }) => {
        // Filter out Alumni, Books, and Contact when on e-learning portal related pages
        if (isELearningRelatedPage && 
            (destination === 'alumni' || 
             destination === 'books' || 
             destination === 'contact')) {
          return null;
        }

        // Hide e-learning portal link when already on an e-learning related page
        if (destination === 'e-learning-portal' && isELearningRelatedPage) {
          return null;
        }

        // When on e-learning portal related pages, Home should link back to homepage
        if (destination === '#' && isELearningRelatedPage) {
          return (
            <Link href="/" key={destination} passHref>
              <Box
                component="a"
                sx={{
                  position: 'relative',
                  color: 'text.disabled',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: { xs: 0, md: 3 },
                  mb: { xs: 3, md: 0 },
                  fontSize: { xs: '1.2rem', md: 'inherit' },
                  textDecoration: 'none',
                  '& > div': { display: 'none' },
                  '&:hover': {
                    color: 'primary.main',
                    '&>div': {
                      display: 'block',
                    },
                  },
                }}
                onClick={handleLinkClick}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    transform: 'rotate(3deg)',
                    '& img': { width: 44, height: 'auto' },
                  }}
                >
                  {/* eslint-disable-next-line */}
                  <img src="/images/headline-curve.svg" alt="Headline curve" />
                </Box>
                {label}
              </Box>
            </Link>
          );
        }

        // E-learning portal link
        if (destination === 'e-learning-portal') {
          return (
            <Link href={`/${destination}`} key={destination} passHref>
              <Box
                component="a"
                sx={{
                  position: 'relative',
                  color: router.pathname === `/${destination}` ? 'primary.main' : 'text.disabled',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: { xs: 0, md: 3 },
                  mb: { xs: 3, md: 0 },
                  fontSize: { xs: '1.2rem', md: 'inherit' },
                  textDecoration: 'none',
                  '& > div': { display: 'none' },
                  '&:hover': {
                    color: 'primary.main',
                    '&>div': {
                      display: 'block',
                    },
                  },
                }}
                onClick={handleLinkClick}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    transform: 'rotate(3deg)',
                    '& img': { width: 44, height: 'auto' },
                    display: router.pathname === `/${destination}` ? 'block' : 'none',
                  }}
                >
                  {/* eslint-disable-next-line */}
                  <img src="/images/headline-curve.svg" alt="Headline curve" />
                </Box>
                {label}
              </Box>
            </Link>
          );
        }
        
        // Default ScrollLink for all other navigation items (when not on e-learning portal)
        return (
          <Box
            component={ScrollLink}
            key={destination}
            activeClass="current"
            to={destination}
            spy={true}
            smooth={true}
            duration={350}
            onClick={handleLinkClick}
            sx={{
              position: 'relative',
              color: 'text.disabled',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: { xs: 0, md: 3 },
              mb: { xs: 3, md: 0 },
              fontSize: { xs: '1.2rem', md: 'inherit' },
              ...(destination === '/' && {
                color: 'primary.main',
              }),
              '& > div': { display: 'none' },
              '&.current>div': { display: 'block' },
              '&:hover': {
                color: 'primary.main',
                '&>div': {
                  display: 'block',
                },
              },
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                transform: 'rotate(3deg)',
                '& img': { width: 44, height: 'auto' },
              }}
            >
              {/* eslint-disable-next-line */}
              <img src="/images/headline-curve.svg" alt="Headline curve" />
            </Box>
            {label}
          </Box>
        );
      })}

      {/* Add Login link for e-learning related pages */}
      {isELearningRelatedPage && router.pathname !== '/login' && (
        <Link href="/login" passHref>
          <Box
            component="a"
            sx={{
              position: 'relative',
              color: 'text.disabled',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: { xs: 0, md: 3 },
              mb: { xs: 3, md: 0 },
              fontSize: { xs: '1.2rem', md: 'inherit' },
              textDecoration: 'none',
              '& > div': { display: 'none' },
              '&:hover': {
                color: 'primary.main',
                '&>div': {
                  display: 'block',
                },
              },
            }}
            onClick={handleLinkClick}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                transform: 'rotate(3deg)',
                '& img': { width: 44, height: 'auto' },
              }}
            >
              {/* eslint-disable-next-line */}
              <img src="/images/headline-curve.svg" alt="Headline curve" />
            </Box>
            Login
          </Box>
        </Link>
      )}
    </Box>
  )
}

export default Navigation
