import { useRouter } from 'next/router'
import { createClient } from '@/utils/supabase/client'

export const useSignOut = () => {
  const router = useRouter()

  const signOut = async (): Promise<void> => {
    try {
      // Immediately redirect for better UX
      router.push('/login')
      
      // Sign out in background - no need to wait for this
      const supabase = createClient()
      supabase.auth.signOut().catch((error) => {
        console.error('Error signing out:', error)
      })
    } catch (error) {
      console.error('Error signing out:', error)
      // Still redirect even if there's an error
      router.push('/login')
    }
  }

  return { signOut }
} 