import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getCurrentUser, type User } from '@/lib/cognitoClient'

interface UseAuthRedirectOptions {
  redirectTo?: string
  redirectIf?: 'authenticated' | 'unauthenticated'
  enabled?: boolean
}

interface UseAuthRedirectReturn {
  user: User | null
  loading: boolean
  checking: boolean
}

/**
 * Fast client-side authentication hook with optional redirection
 * This replaces slow server-side auth checks for better UX
 * 
 * @param options Configuration for redirection behavior
 * @returns Authentication state and user data
 */
export function useAuthRedirect(options: UseAuthRedirectOptions = {}): UseAuthRedirectReturn {
  const {
    redirectTo,
    redirectIf = 'unauthenticated',
    enabled = true
  } = options

  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      setChecking(false)
      return
    }

    let mounted = true

    const checkAuth = async (): Promise<void> => {
      try {
        // Check current user with Cognito
        const currentUser = await getCurrentUser()
        
        if (!mounted) return

        setUser(currentUser)

        // Handle redirection logic
        if (redirectTo) {
          const isAuthenticated = !!currentUser
          const shouldRedirect = 
            (redirectIf === 'authenticated' && isAuthenticated) ||
            (redirectIf === 'unauthenticated' && !isAuthenticated)

          if (shouldRedirect) {
            // Use replace to avoid back button issues
            router.replace(redirectTo)
            return
          }
        }

        setLoading(false)
        setChecking(false)
      } catch (error) {
        console.error('Auth check error:', error)
        if (mounted) {
          setUser(null)
          setLoading(false)
          setChecking(false)
        }
      }
    }

    // Initial check
    checkAuth()

    // For Cognito, we'll need to implement auth state listening differently
    // This is a simplified version - you might want to add Hub listeners for Amplify
    const interval = setInterval(() => {
      if (mounted) {
        checkAuth()
      }
    }, 5000) // Check every 5 seconds for auth state changes

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [enabled, redirectTo, redirectIf, router])

  return { user, loading, checking }
} 