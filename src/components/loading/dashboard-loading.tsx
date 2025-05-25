import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Chip,
  Fade,
  Container,
  Grid
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CircularProgress from '@mui/material/CircularProgress'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

const steps = [
  { label: 'Authentication', duration: 3000 },
  { label: 'Environment Setup', duration: 5000 },
  { label: 'Content Loading', duration: 7000 },
  { label: 'Dashboard Preparation', duration: 20000 }, // This will stay loading until onComplete
]

const facts = [
  "Economics studies how societies allocate scarce resources to meet unlimited wants.",
  "The law of supply and demand determines prices in free markets.",
  "GDP measures the total value of goods and services produced in a country.",
  "Inflation occurs when the general price level of goods and services rises.",
  "Opportunity cost is the value of the next best alternative when making a choice.",
  "Market equilibrium occurs where supply and demand curves intersect.",
  "Elasticity measures how responsive quantity is to changes in price.",
  "Fiscal policy uses government spending and taxation to influence the economy.",
  "Monetary policy controls money supply and interest rates to manage economic growth.",
  "Comparative advantage explains why countries benefit from international trade.",
  "The multiplier effect shows how initial spending creates additional economic activity.",
  "Consumer surplus is the difference between what consumers pay and what they're willing to pay."
]

interface DashboardLoadingProps {
  message?: string
  onComplete?: () => void
}

const DashboardLoading: React.FC<DashboardLoadingProps> = ({ 
  message = "Setting up your dashboard...", 
  onComplete 
}) => {
  const [activeStep, setActiveStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [currentFactIndex, setCurrentFactIndex] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set<number>())
  const [isCompleted, setIsCompleted] = useState(false)
  const stepTimers = React.useRef<NodeJS.Timeout[]>([])

  // Calculate progress based on completed steps and elapsed time
  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const baseProgress = (completedSteps.size / steps.length) * 100
        const timeProgress = Math.min((elapsedTime / 20) * 100, 100)
        return Math.min(Math.max(baseProgress, timeProgress), 100)
      })
    }, 100)

    return () => clearInterval(progressTimer)
  }, [completedSteps.size, elapsedTime])

  // Elapsed time counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Fact rotation
  useEffect(() => {
    const factTimer = setInterval(() => {
      setCurrentFactIndex(prev => (prev + 1) % facts.length)
    }, 4000)

    return () => clearInterval(factTimer)
  }, [])

  // Step progression
  useEffect(() => {
    steps.forEach((step, index) => {
      const timer = setTimeout(() => {
        setCompletedSteps(prev => {
          const newCompleted = new Set(prev)
          newCompleted.add(index)
          return newCompleted
        })
        
        // Don't advance to the last step until completion
        if (index < steps.length - 1) {
          setActiveStep(index + 1)
        }
      }, step.duration)

      stepTimers.current.push(timer)
    })

    // Auto-timeout after 25 seconds (5 seconds buffer beyond expected 20 seconds)
    const timeoutTimer = setTimeout(() => {
      if (onComplete && !isCompleted) {
        setIsCompleted(true)
        onComplete()
      }
    }, 25000)

    stepTimers.current.push(timeoutTimer)

    return () => {
      stepTimers.current.forEach(timer => clearTimeout(timer))
      stepTimers.current = []
    }
  }, [onComplete, isCompleted])

  // Handle external completion signal
  useEffect(() => {
    if (isCompleted) {
      // Mark the last step as completed when the page is ready
      setCompletedSteps(prev => {
        const newCompleted = new Set(prev)
        newCompleted.add(steps.length - 1)
        return newCompleted
      })
      setActiveStep(steps.length)
      setProgress(100)
    }
  }, [isCompleted])

  const getStepIcon = (stepIndex: number): JSX.Element => {
    if (completedSteps.has(stepIndex)) {
      return <CheckCircleIcon sx={{ color: 'success.main' }} />
    } else if (stepIndex === activeStep) {
      return <CircularProgress size={24} sx={{ color: 'primary.main' }} />
    } else {
      return <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'grey.300' }} />
    }
  }

  const currentFact = facts[currentFactIndex]

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'background.default',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}
    >
      <Container maxWidth="md">
        <Grid container spacing={4} alignItems="center">
          {/* Left side - Progress and Steps */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 3, sm: 4 }, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'primary.main',
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}
                >
                  {message}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Expected time: ~20 seconds • Elapsed: {elapsedTime}s
              </Typography>
              
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                  mb: 3, 
                  height: 8, 
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4
                  }
                }} 
              />
              
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel
                      icon={getStepIcon(index)}
                      sx={{
                        '& .MuiStepLabel-label': {
                          fontWeight: completedSteps.has(index) ? 'bold' : 'normal',
                          color: completedSteps.has(index) ? 'primary.main' : 'text.secondary',
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                      }}
                    >
                      {step.label}
                    </StepLabel>
                    <StepContent>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        {step.label}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          </Grid>

          {/* Right side - Educational Content */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 3, sm: 4 }, 
                borderRadius: 3,
                minHeight: { xs: 'auto', md: 400 },
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            >
              <Fade in={true} timeout={1000}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Chip 
                      label="Economics Fact"
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                  
                  <Typography 
                    variant="h6"
                    sx={{ 
                      fontWeight: 'bold',
                      mb: 2,
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}
                  >
                    Did you know?
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      lineHeight: 1.6,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      opacity: 0.9
                    }}
                  >
                    {currentFact}
                  </Typography>

                  <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    <Typography variant="body2" sx={{ opacity: 0.8, textAlign: 'center' }}>
                      💡 Keep learning while we prepare your personalized dashboard
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default DashboardLoading 