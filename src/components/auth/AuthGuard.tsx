import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import Backdrop from '@mui/material/Backdrop'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'

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
  const { user, loading, checking } = useAuthRedirect({
    redirectTo: requireAuth ? undefined : redirectTo,
    redirectIf: requireAuth ? 'unauthenticated' : 'authenticated',
    enabled: true
  })

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

  // If we don't require auth but user is authenticated, show loading
  // (the hook will handle redirection)
  if (!requireAuth && user) {
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
          Redirecting to dashboard...
        </Typography>
      </Backdrop>
    )
  }

  return <>{children}</>
} 