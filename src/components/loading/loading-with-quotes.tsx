import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Fade from '@mui/material/Fade'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

const economicsQuotes = [
  {
    quote: "Economics is the science of making the most of life.",
    author: "George Bernard Shaw"
  },
  {
    quote: "Supply and demand: The heart of every economic transaction.",
    topic: "CBSE Class XI - Market Forces"
  },
  {
    quote: "Opportunity cost is the cost of the next best alternative forgone.",
    topic: "CBSE Class XI - Basic Concepts"
  },
  {
    quote: "Money is a medium of exchange, unit of account, and store of value.",
    topic: "CBSE Class XII - Money and Banking"
  },
  {
    quote: "GDP measures the total value of goods and services produced in an economy.",
    topic: "CBSE Class XII - National Income"
  },
  {
    quote: "Elasticity measures how responsive quantity demanded is to price changes.",
    topic: "CBSE Class XI - Demand Analysis"
  },
  {
    quote: "Perfect competition leads to economic efficiency and consumer welfare.",
    topic: "CBSE Class XI - Market Structure"
  },
  {
    quote: "Fiscal policy uses government spending and taxation to influence the economy.",
    topic: "CBSE Class XII - Government Budget"
  },
  {
    quote: "Investment in human capital drives long-term economic growth.",
    topic: "CBSE Class XI - Development Economics"
  },
  {
    quote: "Comparative advantage explains why nations benefit from international trade.",
    topic: "CBSE Class XII - International Economics"
  }
]

interface LoadingWithQuotesProps {
  message?: string
}

const LoadingWithQuotes: React.FC<LoadingWithQuotesProps> = ({ 
  message = "Preparing your Economics Portal..." 
}) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false)
      
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % economicsQuotes.length)
        setFadeIn(true)
      }, 300)
    }, 3000) // Change quote every 3 seconds

    return () => clearInterval(interval)
  }, [])

  const currentQuote = economicsQuotes[currentQuoteIndex]

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
        p: 3
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CircularProgress 
          size={60} 
          sx={{ 
            color: 'white',
            mb: 3
          }} 
        />
        <Typography 
          variant="h5" 
          sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            mb: 1
          }}
        >
          {message}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.8)'
          }}
        >
          Please wait while we load your dashboard...
        </Typography>
      </Box>

      <Card 
        sx={{ 
          maxWidth: 600, 
          mx: 'auto',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'primary.main', 
              fontWeight: 'bold',
              mb: 2
            }}
          >
            💡 Economics Insight
          </Typography>
          
          <Fade in={fadeIn} timeout={300}>
            <Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontStyle: 'italic',
                  fontSize: '1.1rem',
                  mb: 2,
                  color: 'text.primary',
                  lineHeight: 1.6
                }}
              >
                &ldquo;{currentQuote.quote}&rdquo;
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 'medium'
                }}
              >
                {currentQuote.author || currentQuote.topic}
              </Typography>
            </Box>
          </Fade>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        {economicsQuotes.map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: index === currentQuoteIndex 
                ? 'white' 
                : 'rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </Box>
    </Box>
  )
}

export default LoadingWithQuotes 