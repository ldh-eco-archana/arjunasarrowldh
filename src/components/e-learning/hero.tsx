import React, { FC, useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { StyledButton } from '@/components/styled-button'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import LoadingWithQuotes from '@/components/loading/loading-with-quotes'

const ELearningHero: FC = () => {
  const router = useRouter();
  const [isNavigatingToSignup, setIsNavigatingToSignup] = useState(false);
  const [isNavigatingToLogin, setIsNavigatingToLogin] = useState(false);

  // Reset loading states when route changes
  useEffect(() => {
    const handleRouteChangeComplete = (): void => {
      setIsNavigatingToSignup(false);
      setIsNavigatingToLogin(false);
    };

    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeComplete);
    };
  }, [router.events]);

  const handleSignupClick = (): void => {
    setIsNavigatingToSignup(true);
    router.push('/signup');
  };

  const handleLoginClick = (): void => {
    setIsNavigatingToLogin(true);
    router.push('/login');
  };

  return (
    <>
      {/* Show loading screen when navigating */}
      {isNavigatingToSignup && (
        <LoadingWithQuotes message="Setting Up Your Learning Journey..." />
      )}
      {isNavigatingToLogin && (
        <LoadingWithQuotes message="Opening Your Economics Portal..." />
      )}
      
    
    <Box id="hero" sx={{ backgroundColor: 'background.paper', position: 'relative', pt: 4, pb: { xs: 8, md: 10 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={0} sx={{ flexDirection: { xs: 'column', md: 'unset' } }}>
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                textAlign: { xs: 'center', md: 'left' },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography
                  component="h1"
                  sx={{
                    position: 'relative',
                    fontSize: { xs: 40, md: 72 },
                    letterSpacing: 1.5,
                    fontWeight: 'bold',
                    lineHeight: 1.3,
                  }}
                >
                  <Typography
                    component="mark"
                    sx={{
                      position: 'relative',
                      color: 'primary.main',
                      fontSize: 'inherit',
                      fontWeight: 'inherit',
                      backgroundColor: 'unset',
                    }}
                  >
                    Digital Learning{' '}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: { xs: 24, md: 34 },
                        left: 2,
                        transform: 'rotate(3deg)',
                        '& img': { width: { xs: 146, md: 210 }, height: 'auto' },
                      }}
                    >
                      {/* eslint-disable-next-line */}
                      <img src="/images/headline-curve.svg" alt="Headline curve" />
                    </Box>
                  </Typography>
                  for Economics{' '}
                  <Typography
                    component="span"
                    sx={{
                      fontSize: 'inherit',
                      fontWeight: 'inherit',
                      position: 'relative',
                      '& svg': {
                        position: 'absolute',
                        top: -16,
                        right: -21,
                        width: { xs: 22, md: 30 },
                        height: 'auto',
                      },
                    }}
                  >
                    Excellence
                    <svg version="1.1" viewBox="0 0 3183 3072">
                      <g id="Layer_x0020_1">
                        <path
                          fill="#127C71"
                          d="M2600 224c0,0 0,0 0,0 236,198 259,562 52,809 -254,303 -1849,2089 -2221,1776 -301,-190 917,-1964 1363,-2496 207,-247 570,-287 806,-89z"
                        />
                        <path
                          fill="#127C71"
                          d="M3166 2190c0,0 0,0 0,0 64,210 -58,443 -270,516 -260,90 -1848,585 -1948,252 -104,-230 1262,-860 1718,-1018 212,-73 437,39 500,250z"
                        />
                        <path
                          fill="#127C71"
                          d="M566 3c0,0 0,0 0,0 -219,-26 -427,134 -462,356 -44,271 -255,1921 90,1962 245,62 628,-1392 704,-1869 36,-221 -114,-424 -332,-449z"
                        />
                      </g>
                    </svg>
                  </Typography>
                </Typography>
              </Box>
              <Box sx={{ mb: 4, width: { xs: '100%', md: '70%' } }}>
                <Typography sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  {"Access our comprehensive digital economics learning platform. Chapter-wise video lectures, PDF study materials, practice tests, and personalized feedback to excel in your board exams. Study anytime, anywhere with our structured curriculum designed by experts."}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, '& button': { mr: 2 }, alignItems: { xs: 'center', sm: 'flex-start' } }}>
                <Box sx={{ mb: { xs: 2, sm: 0 }, mr: { xs: 0, sm: 2 } }}>
                  <StyledButton 
                    color="primary" 
                    size="large" 
                    variant="contained"
                    onClick={handleSignupClick}
                  >
                    Join Our Platform
                  </StyledButton>
                </Box>
                <Box sx={{ width: { xs: 'fit-content', sm: 'auto' } }}>
                  <StyledButton 
                    color="primary" 
                    size="large" 
                    variant="outlined"
                    onClick={handleLoginClick}
                  >
                    Login to Platform
                  </StyledButton>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={5} sx={{ position: 'relative' }}>
            <Box sx={{ lineHeight: 0 }}>
              <Image src="/images/e-learning-portal/hero.png" width={775} height={787} alt="E-learning platform" />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
    </>
  )
}

export default ELearningHero 