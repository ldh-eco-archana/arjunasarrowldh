import { useAuth } from '@/contexts/AuthContext'

export const useSignOut = (): {
  signOut: () => Promise<void>
} => {
  const { signOut } = useAuth()
  
  return { signOut }
} 