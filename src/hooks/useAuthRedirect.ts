import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

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
    const supabase = createClient()

    const checkAuth = async () => {
      try {
        // Fast session check - doesn't hit the server
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (error) {
          console.error('Auth check error:', error)
          setUser(null)
        } else {
          setUser(session?.user || null)
        }

        // Handle redirection logic
        if (redirectTo) {
          const isAuthenticated = !!(session?.user)
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
        console.error('Unexpected auth error:', error)
        if (mounted) {
          setUser(null)
          setLoading(false)
          setChecking(false)
        }
      }
    }

    // Initial check
    checkAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        setUser(session?.user || null)
        
        // Handle redirection on auth state change
        if (redirectTo) {
          const isAuthenticated = !!(session?.user)
          const shouldRedirect = 
            (redirectIf === 'authenticated' && isAuthenticated) ||
            (redirectIf === 'unauthenticated' && !isAuthenticated)

          if (shouldRedirect) {
            router.replace(redirectTo)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [enabled, redirectTo, redirectIf, router])

  return { user, loading, checking }
} 