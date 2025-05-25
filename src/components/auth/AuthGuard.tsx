import React, { useState, useEffect } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import Backdrop from '@mui/material/Backdrop'
import { useRouter } from 'next/router'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import DashboardLoading from '@/components/loading/dashboard-loading'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

/**
 * AuthGuard component for protecting routes with loading states
 * Provides a consistent loading experience across the app
 */
export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login',
  fallback
}: AuthGuardProps): JSX.Element {
  const router = useRouter()
  const [showDashboardLoading, setShowDashboardLoading] = useState(false)
  const [dashboardReady, setDashboardReady] = useState(false)
  
  // Determine if we should show dashboard loading instead of immediate redirect
  const shouldShowDashboardLoading = !requireAuth && redirectTo === '/dashboard'
  
  const { user, loading, checking } = useAuthRedirect({
    redirectTo: shouldShowDashboardLoading ? undefined : redirectTo, // Disable auto-redirect for dashboard
    redirectIf: requireAuth ? 'unauthenticated' : 'authenticated',
    enabled: true
  })

  // Handle dashboard loading when user is authenticated and should be redirected to dashboard
  useEffect(() => {
    if (!requireAuth && user && redirectTo === '/dashboard' && !showDashboardLoading && !dashboardReady) {
      setShowDashboardLoading(true)
    }
  }, [user, requireAuth, redirectTo, showDashboardLoading, dashboardReady])

  // Handle manual redirection after dashboard loading is complete
  useEffect(() => {
    if (dashboardReady && shouldShowDashboardLoading && user) {
      router.replace('/dashboard')
    }
  }, [dashboardReady, shouldShowDashboardLoading, user, router])

  // Show loading state while checking authentication
  if (checking || loading) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2 
        }}
        open={true}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6">
          {requireAuth ? 'Verifying access...' : 'Checking authentication...'}
        </Typography>
      </Backdrop>
    )
  }

  // If we require auth but user is not authenticated, show loading
  // (the hook will handle redirection)
  if (requireAuth && !user) {
    return (
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2 
        }}
        open={true}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6">
          Redirecting to login...
        </Typography>
      </Backdrop>
    )
  }

  // If we don't require auth but user is authenticated, show enhanced dashboard loading
  if (!requireAuth && user) {
    // Check if we're redirecting to dashboard and should show loading
    if (redirectTo === '/dashboard' && showDashboardLoading && !dashboardReady) {
      return (
        <DashboardLoading 
          message="Welcome back! Setting up your dashboard..."
          onComplete={() => {
            setDashboardReady(true)
          }}
        />
      )
    }

    // For non-dashboard redirects, handle them normally
    if (redirectTo !== '/dashboard') {
      router.replace(redirectTo)
      return (
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            flexDirection: 'column',
            gap: 2 
          }}
          open={true}
        >
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6">
            Redirecting...
          </Typography>
        </Backdrop>
      )
    }
  }

  return <>{children}</>
} 