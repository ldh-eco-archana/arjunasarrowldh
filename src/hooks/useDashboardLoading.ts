import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'

interface UseDashboardLoadingOptions {
  minLoadingTime?: number // Minimum time to show loading (in ms)
  maxLoadingTime?: number // Maximum time before timeout (in ms)
}

interface UseDashboardLoadingReturn {
  isLoading: boolean
  showDashboardLoading: boolean
  startLoading: () => void
  stopLoading: () => void
  progress: number
}

export const useDashboardLoading = (
  options: UseDashboardLoadingOptions = {}
): UseDashboardLoadingReturn => {
  const {
    minLoadingTime = 2000, // Show loading for at least 2 seconds
    maxLoadingTime = 15000  // Timeout after 15 seconds
  } = options

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showDashboardLoading, setShowDashboardLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setShowDashboardLoading(true)
    setProgress(0)
    setStartTime(Date.now())
  }, [])

  const stopLoading = useCallback(() => {
    if (!startTime) return

    const elapsedTime = Date.now() - startTime
    const remainingTime = Math.max(0, minLoadingTime - elapsedTime)

    // Ensure minimum loading time for better UX
    setTimeout(() => {
      setIsLoading(false)
      setShowDashboardLoading(false)
      setProgress(100)
    }, remainingTime)
  }, [startTime, minLoadingTime])

  // Progress simulation
  useEffect(() => {
    if (!isLoading || !startTime) return

    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime
      const progressPercentage = Math.min((elapsedTime / maxLoadingTime) * 100, 95)
      setProgress(progressPercentage)
    }, 100)

    return () => clearInterval(interval)
  }, [isLoading, startTime, maxLoadingTime])

  // Auto-timeout protection
  useEffect(() => {
    if (!isLoading || !startTime) return

    const timeout = setTimeout(() => {
      console.warn('Dashboard loading timed out after', maxLoadingTime, 'ms')
      setIsLoading(false)
      setShowDashboardLoading(false)
      setProgress(100)
    }, maxLoadingTime)

    return () => clearTimeout(timeout)
  }, [isLoading, startTime, maxLoadingTime])

  // Handle route changes
  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      if (url === '/dashboard') {
        startLoading()
      }
    }

    const handleRouteChangeComplete = (url: string) => {
      if (url === '/dashboard') {
        stopLoading()
      }
    }

    const handleRouteChangeError = () => {
      setIsLoading(false)
      setShowDashboardLoading(false)
    }

    router.events.on('routeChangeStart', handleRouteChangeStart)
    router.events.on('routeChangeComplete', handleRouteChangeComplete)
    router.events.on('routeChangeError', handleRouteChangeError)

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart)
      router.events.off('routeChangeComplete', handleRouteChangeComplete)
      router.events.off('routeChangeError', handleRouteChangeError)
    }
  }, [router.events, startLoading, stopLoading])

  return {
    isLoading,
    showDashboardLoading,
    startLoading,
    stopLoading,
    progress
  }
} 