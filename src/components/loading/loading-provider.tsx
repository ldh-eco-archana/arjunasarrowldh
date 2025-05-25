import React, { createContext, useContext, useState, ReactNode } from 'react'
import DashboardLoading from './dashboard-loading'
import LoadingWithQuotes from './loading-with-quotes'

type LoadingType = 'dashboard' | 'general' | null

interface LoadingContextType {
  showLoading: (type: LoadingType, message?: string) => void
  hideLoading: () => void
  isLoading: boolean
  loadingType: LoadingType
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

interface LoadingProviderProps {
  children: ReactNode
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingType, setLoadingType] = useState<LoadingType>(null)
  const [loadingMessage, setLoadingMessage] = useState<string>('')

  const showLoading = (type: LoadingType, message?: string): void => {
    setLoadingType(type)
    setLoadingMessage(message || '')
    setIsLoading(true)
  }

  const hideLoading = (): void => {
    setIsLoading(false)
    setLoadingType(null)
    setLoadingMessage('')
  }

  const handleLoadingComplete = (): void => {
    hideLoading()
  }

  const renderLoadingComponent = (): JSX.Element | null => {
    if (!isLoading) return null

    switch (loadingType) {
      case 'dashboard':
        return (
          <DashboardLoading
            message={loadingMessage || "Setting up your dashboard..."}
            onComplete={handleLoadingComplete}
          />
        )
      case 'general':
        return (
          <LoadingWithQuotes
            message={loadingMessage || "Loading..."}
          />
        )
      default:
        return null
    }
  }

  return (
    <LoadingContext.Provider
      value={{
        showLoading,
        hideLoading,
        isLoading,
        loadingType
      }}
    >
      {children}
      {renderLoadingComponent()}
    </LoadingContext.Provider>
  )
}

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
} 