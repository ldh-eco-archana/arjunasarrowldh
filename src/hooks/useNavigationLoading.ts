import { useState } from 'react'
import { useRouter } from 'next/router'

export const useNavigationLoading = (): {
  isNavigating: boolean
  navigateWithLoading: (path: string, delay?: number) => Promise<void>
  resetLoading: () => void
} => {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const navigateWithLoading = async (path: string, delay = 0): Promise<void> => {
    setIsNavigating(true)
    
    // Add a small delay if needed
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    await router.push(path)
  }

  const resetLoading = (): void => {
    setIsNavigating(false)
  }

  return {
    isNavigating,
    navigateWithLoading,
    resetLoading
  }
} 