import React, { FC, useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import QuizIcon from '@mui/icons-material/Quiz'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { StyledButton } from '@/components/styled-button'
import Image from 'next/image'
import { useRouter } from 'next/router'
import LoadingWithQuotes from '@/components/loading/loading-with-quotes'

interface FeatureItem {
  id: number
  icon: React.ReactNode
  title: string
  description: string
}

const features: FeatureItem[] = [
  {
    id: 1,
    icon: <VideoLibraryIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
    title: 'Video Lectures',
    description: 'Chapter-wise video lectures explaining complex economics concepts with real-world examples',
  },
  {
    id: 2,
    icon: <MenuBookIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
    title: 'Study Materials',
    description: 'Comprehensive PDF notes, diagrams, and practice worksheets for every topic in the curriculum',
  },
  {
    id: 3,
    icon: <QuizIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
    title: 'Practice Question Papers',
    description: 'Topic-wise and full-length practice Questions with detailed solutions and performance analytics',
  },
  {
    id: 4,
    icon: <SupportAgentIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
    title: 'Expert Support',
    description: 'Get your doubts cleared by our economics experts',
  },
]

const ELearningFeatures: FC = () => {
  const router = useRouter();
  const [isNavigatingToSignup, setIsNavigatingToSignup] = useState(false);

  // Reset loading state when route changes
  useEffect(() => {
    const handleRouteChangeComplete = (): void => {
      setIsNavigatingToSignup(false);
    };

    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeComplete);
    };
  }, [router.events]);

  const handleStartLearning = (): void => {
    setIsNavigatingToSignup(true);
    router.push('/signup');
  };

  return (
    <>
      {/* Show loading screen when navigating to signup */}
      {isNavigatingToSignup && (
        <LoadingWithQuotes message="Getting Your Learning Journey Ready..." />
      )}
      
    
    <Box sx={{ py: { xs: 8, md: 10 }, backgroundColor: 'background.default' }}>
      <Container>
        <Grid container spacing={5} alignItems="center">
          <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box
              sx={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                  position: 'relative',
                  width: '100%',
                  height: { sm: 300, md: 400 },
                }}
              >
                <Image
                  src="/images/e-learning-portal/feature.png"
                  alt="E-Learning Features"
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 500px"
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={7}>
            <Box sx={{ position: 'relative' }}>
              <Typography
                component="h2"
                sx={{
                  position: 'relative',
                  fontSize: { xs: 36, md: 46 },
                  mt: { xs: 0, md: 7 },
                  mb: 4,
                  lineHeight: 1,
                  fontWeight: 'bold',
                }}
              >
                Digital Platform Features
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
                  
                </Typography>
              </Typography>

              <Typography sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.6 }}>
                Our e-learning platform provides all the tools you need to excel in economics. Access course materials 24/7, study at your own pace, and track your progress with our intuitive interface.
              </Typography>

              <Box sx={{ mb: 5 }}>
                <StyledButton
                  color="primary"
                  size="large"
                  variant="contained"
                  onClick={handleStartLearning}
                >
                  Start Learning Now
                </StyledButton>
              </Box>
              
              <Grid container spacing={3}>
                {features.map((item) => (
                  <Grid item xs={12} sm={6} key={item.id}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                          transform: 'translateY(-5px)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ mb: 2 }}>{item.icon}</Box>
                        <Typography component="h3" variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
                          {item.title}
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                          {item.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
    </>
  )
}

export default ELearningFeatures 