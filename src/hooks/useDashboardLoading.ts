import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'

interface UseDashboardLoadingOptions {
  minLoadingTime?: number
  autoTimeout?: number
  onComplete?: () => void
}

interface UseDashboardLoadingReturn {
  isLoading: boolean
  progress: number
  currentStep: number
  elapsedTime: number
  startLoading: () => void
  completeLoading: () => void
}

export function useDashboardLoading(options: UseDashboardLoadingOptions = {}): UseDashboardLoadingReturn {
  const {
    minLoadingTime = 20000, // Updated to 20 seconds
    autoTimeout = 25000, // 25 second timeout
    onComplete
  } = options

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)

  const steps = [
    { label: 'Authentication', duration: 3000 },
    { label: 'Environment Setup', duration: 5000 },
    { label: 'Content Loading', duration: 7000 },
    { label: 'Dashboard Preparation', duration: 20000 }, // Will stay loading until completion
  ]

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setProgress(0)
    setCurrentStep(0)
    setElapsedTime(0)
    setStartTime(Date.now())
  }, [])

  const completeLoading = useCallback(() => {
    const now = Date.now()
    const elapsed = startTime ? now - startTime : 0
    
    if (elapsed < minLoadingTime) {
      // Wait for minimum loading time
      setTimeout(() => {
        setIsLoading(false)
        setProgress(100)
        setCurrentStep(steps.length)
        onComplete?.()
      }, minLoadingTime - elapsed)
    } else {
      setIsLoading(false)
      setProgress(100)
      setCurrentStep(steps.length)
      onComplete?.()
    }
  }, [startTime, minLoadingTime, onComplete, steps.length])

  // Progress and step management
  useEffect(() => {
    if (!isLoading) return

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const timeProgress = Math.min((elapsedTime / 20) * 100, 95) // Cap at 95% until completion
        return Math.max(prev, timeProgress)
      })
    }, 100)

    const timeTimer = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)

    // Step progression
    steps.forEach((step, index) => {
      setTimeout(() => {
        if (index < steps.length - 1) { // Don't auto-advance to last step
          setCurrentStep(index + 1)
        }
      }, step.duration)
    })

    // Auto-timeout
    const timeoutTimer = setTimeout(() => {
      completeLoading()
    }, autoTimeout)

    return () => {
      clearInterval(progressTimer)
      clearInterval(timeTimer)
      clearTimeout(timeoutTimer)
    }
  }, [isLoading, elapsedTime, completeLoading, autoTimeout])

  // Handle route changes
  useEffect(() => {
    const handleRouteChangeStart = (): void => {
      if (router.pathname === '/dashboard') {
        startLoading()
      }
    }

    const handleRouteChangeComplete = (): void => {
      if (router.pathname === '/dashboard') {
        // Small delay to ensure page is fully loaded
        setTimeout(() => {
          completeLoading()
        }, 1000)
      }
    }

    router.events.on('routeChangeStart', handleRouteChangeStart)
    router.events.on('routeChangeComplete', handleRouteChangeComplete)

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart)
      router.events.off('routeChangeComplete', handleRouteChangeComplete)
    }
  }, [router, startLoading, completeLoading])

  return {
    isLoading,
    progress,
    currentStep,
    elapsedTime,
    startLoading,
    completeLoading
  }
} 