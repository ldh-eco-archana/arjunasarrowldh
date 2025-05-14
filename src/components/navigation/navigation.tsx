import React, { FC } from 'react'
import Box from '@mui/material/Box'
import { Link as ScrollLink } from 'react-scroll'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { navigations } from './navigation.data'

const Navigation: FC = () => {
  const router = useRouter();
  const isELearningRelatedPage = 
    router.pathname === '/e-learning-portal' || 
    router.pathname === '/login' || 
    router.pathname === '/signup' || 
    router.pathname === '/payment';

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
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
