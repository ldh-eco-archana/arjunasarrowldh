import React, { useEffect } from 'react'
import { CircularProgress, Typography } from '@mui/material'
import Backdrop from '@mui/material/Backdrop'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import DashboardLoading from '@/components/loading/dashboard-loading'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

/**
 * Optimized AuthGuard component for protecting routes with instant redirects
 * Uses cached authentication state for immediate decisions
 */
export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login',
  fallback
}: AuthGuardProps): JSX.Element {
  const { user: _user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Skip if still loading
    if (isLoading) return

    // Handle authentication-based redirects
    if (requireAuth && !isAuthenticated) {
      // Redirect unauthenticated users to login
      router.replace(redirectTo)
    } else if (!requireAuth && isAuthenticated && redirectTo) {
      // Redirect authenticated users away from guest pages
      router.replace(redirectTo)
    }
  }, [isLoading, isAuthenticated, requireAuth, redirectTo, router])

  // Initial loading state
  if (isLoading) {
    if (fallback) {
      return <>{fallback}</>
    }

    // For login page, show minimal loading
    if (!requireAuth) {
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
        </Backdrop>
      )
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
          Loading...
        </Typography>
      </Backdrop>
    )
  }

  // If we require auth but user is not authenticated, show redirect message
  if (requireAuth && !isAuthenticated) {
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

  // If we don't require auth but user is authenticated, show redirect message
  if (!requireAuth && isAuthenticated) {
    // Special dashboard loading for login -> dashboard redirect
    if (redirectTo === '/dashboard') {
      return (
        <DashboardLoading 
          message="Welcome back! Setting up your dashboard..."
          onComplete={() => {
            // Navigation is handled by useEffect above
          }}
        />
      )
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
          Redirecting...
        </Typography>
      </Backdrop>
    )
  }

  return <>{children}</>
} 