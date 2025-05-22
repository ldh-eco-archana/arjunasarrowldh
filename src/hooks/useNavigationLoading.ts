import { useState } from 'react'
import { useRouter } from 'next/router'

export const useNavigationLoading = () => {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const navigateWithLoading = async (path: string, delay = 0) => {
    setIsNavigating(true)
    
    // Add a small delay if needed
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    await router.push(path)
  }

  const resetLoading = () => {
    setIsNavigating(false)
  }

  return {
    isNavigating,
    navigateWithLoading,
    resetLoading
  }
} 