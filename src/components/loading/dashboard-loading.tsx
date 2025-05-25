import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Fade from '@mui/material/Fade'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import StepContent from '@mui/material/StepContent'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import SchoolIcon from '@mui/icons-material/School'
import BookIcon from '@mui/icons-material/Book'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

const loadingSteps = [
  {
    label: 'Authenticating your session',
    description: 'Verifying your credentials and permissions',
    duration: 1000,
    icon: '🔐'
  },
  {
    label: 'Starting your learning environment',
    description: 'Initializing serverless functions and databases',
    duration: 4000,
    icon: '⚡'
  },
  {
    label: 'Loading your course content',
    description: 'Fetching your enrolled courses and progress',
    duration: 3000,
    icon: '📚'
  },
  {
    label: 'Preparing your dashboard',
    description: 'Setting up your personalized learning interface',
    duration: 2000,
    icon: '🎯'
  }
]

const economicsFacts = [
  {
    title: "Did you know?",
    content: "The concept of opportunity cost was first introduced by Austrian economist Friedrich von Wieser in 1889.",
    category: "Economic History"
  },
  {
    title: "Quick Tip",
    content: "When studying demand curves, remember: price and quantity demanded move in opposite directions (Law of Demand).",
    category: "Study Tip"
  },
  {
    title: "Exam Focus",
    content: "GDP calculation questions are common in CBSE Class XII. Practice the expenditure method: C + I + G + (X-M).",
    category: "Exam Prep"
  },
  {
    title: "Real World",
    content: "India's GDP growth rate averaged 7.5% from 2014-2019, making it one of the fastest-growing major economies.",
    category: "Current Affairs"
  },
  {
    title: "Study Strategy",
    content: "Create mind maps for complex topics like market structures - it helps visualize relationships between concepts.",
    category: "Study Tip"
  },
  {
    title: "Fun Fact",
    content: "The term 'economics' comes from the Greek words 'oikos' (house) and 'nomos' (law), meaning 'household management'.",
    category: "Etymology"
  }
]

interface DashboardLoadingProps {
  message?: string
  onComplete?: () => void
}

const DashboardLoading: React.FC<DashboardLoadingProps> = ({ 
  message = "Welcome back! Setting up your dashboard...",
  onComplete
}) => {
  const [activeStep, setActiveStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [currentFact, setCurrentFact] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  const totalDuration = loadingSteps.reduce((sum, step) => sum + step.duration, 0)
  const estimatedTime = Math.ceil(totalDuration / 1000)

  useEffect(() => {
    let stepTimer: NodeJS.Timeout
    const progressTimer: NodeJS.Timeout = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (totalDuration / 100))
        return Math.min(newProgress, 100)
      })
    }, 100)

    // Elapsed time counter
    const timeTimer: NodeJS.Timeout = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    // Step progression
    let currentStepIndex = 0

    const progressToNextStep = (): void => {
      if (currentStepIndex < loadingSteps.length) {
        const currentStep = loadingSteps[currentStepIndex]
        
        stepTimer = setTimeout(() => {
          setActiveStep(currentStepIndex + 1)
          currentStepIndex++
          progressToNextStep()
        }, currentStep.duration)
      } else {
        // All steps completed
        setTimeout(() => {
          onComplete?.()
        }, 500)
      }
    }

    progressToNextStep()

    // Fact rotation
    const factTimer: NodeJS.Timeout = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        setCurrentFact((prev) => (prev + 1) % economicsFacts.length)
        setFadeIn(true)
      }, 300)
    }, 4000)

    return () => {
      clearTimeout(stepTimer)
      clearInterval(progressTimer)
      clearInterval(timeTimer)
      clearInterval(factTimer)
    }
  }, [onComplete, totalDuration])

  const getStepIcon = (stepIndex: number): JSX.Element => {
    if (stepIndex < activeStep) {
      return <CheckCircleIcon sx={{ color: 'success.main' }} />
    } else if (stepIndex === activeStep) {
      return <CircularProgress size={24} />
    } else {
      return <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'grey.300' }} />
    }
  }

  const currentFactData = economicsFacts[currentFact]

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(18, 124, 113, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        p: { xs: 2, sm: 3 },
        overflow: 'auto'
      }}
    >
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 }, maxWidth: 600 }}>
        <Avatar
          sx={{
            width: { xs: 60, sm: 80 },
            height: { xs: 60, sm: 80 },
            bgcolor: 'white',
            color: 'primary.main',
            mx: 'auto',
            mb: 2
          }}
        >
          <SchoolIcon sx={{ fontSize: { xs: 30, sm: 40 } }} />
        </Avatar>
        
        <Typography 
          variant="h4"
          sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            mb: 1,
            px: 1,
            fontSize: { xs: '1.5rem', sm: '2.125rem' }
          }}
        >
          {message}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: { xs: 1, sm: 2 }, 
          mb: 2,
          flexWrap: 'wrap'
        }}>
          <Chip 
            label={`~${estimatedTime} seconds`}
            size="small"
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.2)', 
              color: 'white',
              fontWeight: 'medium',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          />
          <Chip 
            label={`${elapsedTime}s elapsed`}
            size="small"
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.1)', 
              color: 'white',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          />
        </Box>

        {/* Progress Bar */}
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{
              height: { xs: 6, sm: 8 },
              borderRadius: 4,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'white',
                borderRadius: 4
              }
            }}
          />
        </Box>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.8)'
          }}
        >
          {Math.round(progress)}% Complete
        </Typography>
      </Box>

      {/* Main Content Area - Responsive Layout */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', lg: 'row' },
        gap: { xs: 3, sm: 4 }, 
        maxWidth: 1200, 
        width: '100%' 
      }}>
        
        {/* Loading Steps */}
        <Card 
          sx={{ 
            flex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography 
              variant="h6"
              sx={{ 
                color: 'primary.main', 
                fontWeight: 'bold',
                mb: { xs: 2, sm: 3 },
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              ⚙️ Loading Progress
            </Typography>
            
            <Stepper activeStep={activeStep} orientation="vertical">
              {loadingSteps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    icon={getStepIcon(index)}
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontWeight: index <= activeStep ? 'bold' : 'normal',
                        color: index <= activeStep ? 'primary.main' : 'text.secondary',
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{step.icon}</span>
                      {step.label}
                    </Box>
                  </StepLabel>
                  <StepContent>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary', 
                        mt: 1,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      {step.description}
                    </Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Educational Content */}
        <Card 
          sx={{ 
            flex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          <CardContent sx={{ 
            p: { xs: 2, sm: 3 }, 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column' 
          }}>
            <Typography 
              variant="h6"
              sx={{ 
                color: 'primary.main', 
                fontWeight: 'bold',
                mb: { xs: 2, sm: 3 },
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              💡 While You Wait...
            </Typography>
            
            <Fade in={fadeIn} timeout={300}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Chip 
                    label={currentFactData.category}
                    size="small"
                    sx={{ 
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      fontWeight: 'medium'
                    }}
                  />
                </Box>
                
                <Typography 
                  variant="h6"
                  sx={{ 
                    fontWeight: 'bold',
                    mb: 2,
                    color: 'text.primary',
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}
                >
                  {currentFactData.title}
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  {currentFactData.content}
                </Typography>
              </Box>
            </Fade>

            {/* Quick Stats */}
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
                Your Learning Journey
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BookIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  <Typography variant="caption">Courses</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption">Progress</Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: { xs: 3, sm: 4 }, textAlign: 'center' }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          Powered by serverless technology • Your data is secure
        </Typography>
      </Box>
    </Box>
  )
}

export default DashboardLoading 