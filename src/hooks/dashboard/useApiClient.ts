import { useCallback } from 'react'
import { getSession } from '@/lib/cognitoClient'
import { useAuth } from '@/contexts/AuthContext'

interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error?: {
    message: string;
    code?: string;
  }
}

interface SessionTokens {
  idToken: {
    toString: () => string;
  };
}

interface ApiClientReturn {
  apiCall: <T = any>(endpoint: string, options?: RequestInit) => Promise<ApiResponse<T>>;
  getAuthHeaders: () => Promise<Record<string, string>>;
}

export const useApiClient = (): ApiClientReturn => {
  const { sessionToken } = useAuth()

  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    let idToken = sessionToken

    if (!idToken) {
      const sessionResult = await getSession()
      if (sessionResult.error || !sessionResult.data.session) {
        throw new Error('Failed to get authentication session')
      }
      const session = sessionResult.data.session as { tokens?: SessionTokens }
      idToken = session?.tokens?.idToken?.toString() || null
      if (!idToken) {
        throw new Error('No valid authentication token found')
      }
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  }, [sessionToken])

  const apiCall = useCallback(async <T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!apiBaseUrl) {
      throw new Error('API base URL not configured')
    }

    const headers = await getAuthHeaders()
    const url = apiBaseUrl.endsWith('/v1') 
      ? `${apiBaseUrl}${endpoint}`
      : `${apiBaseUrl}/v1${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `Request failed: ${response.statusText}`)
    }

    // Handle 204 No Content response
    if (response.status === 204) {
      return { success: true, data: null }
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Request failed')
    }

    return data as ApiResponse<T>
  }, [getAuthHeaders])

  return { apiCall, getAuthHeaders }
}