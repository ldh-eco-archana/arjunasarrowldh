import { useState, useCallback, useEffect } from 'react'
import { useApiClient } from './useApiClient'
import { User } from '@/components/dashboard/types'

export const useUsers = (user: any, isAdmin: boolean): {
  users: User[]
  loadingUsers: boolean
  usersError: string | null
  studentCount: number
  loadUsers: () => Promise<void>
  getUserDetails: (userId: string) => Promise<User | null>
  inviteUser: (userData: {
    email: string
    givenName: string
    familyName: string
    groupName: string
  }) => Promise<any>
  updateUserDetails: (userId: string, userData: {
    email?: string
    givenName?: string
    familyName?: string
  }) => Promise<any>
  resetUserPassword: (userId: string) => Promise<any>
  setTemporaryPassword: (userId: string, temporaryPassword: string) => Promise<any>
} => {
  const { apiCall } = useApiClient()
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [studentCount, setStudentCount] = useState<number>(0)

  const loadUsers = useCallback(async (): Promise<void> => {
    setLoadingUsers(true)
    setUsersError(null)
    
    try {
      const apiResponse = await apiCall('/admin/users')
      // Users loaded successfully
      
      const { users: userList, count } = apiResponse.data
      setUsers(userList)
      setStudentCount(count)
    } catch (error) {
      // Error loading users
      setUsersError(error instanceof Error ? error.message : 'Failed to load users')
    } finally {
      setLoadingUsers(false)
    }
  }, [apiCall])

  const getUserDetails = useCallback(async (userId: string): Promise<User | null> => {
    try {
      const apiResponse = await apiCall(`/admin/users/${encodeURIComponent(userId)}`)
      // User details loaded
      
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data
      }
      return null
    } catch (error) {
      // Error getting user details
      return null
    }
  }, [apiCall])

  const inviteUser = useCallback(async (userData: {
    email: string
    givenName: string
    familyName: string
    groupName: string
  }) => {
    const apiResponse = await apiCall('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
    
    if (apiResponse.success) {
      await loadUsers() // Refresh the users list
    }
    return apiResponse
  }, [apiCall, loadUsers])

  const updateUserDetails = useCallback(async (userId: string, userData: {
    email?: string
    givenName?: string
    familyName?: string
  }) => {
    const apiResponse = await apiCall(`/admin/users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      body: JSON.stringify(userData)
    })
    
    if (apiResponse.success) {
      await loadUsers() // Refresh the users list
    }
    return apiResponse
  }, [apiCall, loadUsers])

  const resetUserPassword = useCallback(async (userId: string) => {
    const apiResponse = await apiCall(`/admin/users/${encodeURIComponent(userId)}/password/reset`, {
      method: 'POST'
    })
    return apiResponse
  }, [apiCall])

  const setTemporaryPassword = useCallback(async (userId: string, temporaryPassword: string) => {
    const apiResponse = await apiCall(`/admin/users/${encodeURIComponent(userId)}/password/set-temporary`, {
      method: 'POST',
      body: JSON.stringify({ temporaryPassword })
    })
    return apiResponse
  }, [apiCall])

  useEffect(() => {
    if (user && isAdmin) {
      loadUsers()
    }
  }, [user, isAdmin, loadUsers])

  return {
    users,
    loadingUsers,
    usersError,
    studentCount,
    loadUsers,
    getUserDetails,
    inviteUser,
    updateUserDetails,
    resetUserPassword,
    setTemporaryPassword
  }
}