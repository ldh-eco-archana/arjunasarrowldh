import { useState, useCallback } from 'react'
import { useApiClient } from './useApiClient'

export const useGroups = (): {
  availableGroups: string[] | null
  loadingGroups: boolean
  groupError: string | null
  loadAvailableGroups: () => Promise<void>
  addUserToGroup: (userId: string, groupName: string) => Promise<any>
  removeUserFromGroup: (userId: string, groupName: string) => Promise<any>
  loadGroupsData: () => Promise<any>
  loadGroupUsers: (groupName: string) => Promise<any>
} => {
  const { apiCall } = useApiClient()
  const [availableGroups, setAvailableGroups] = useState<string[]>([])
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [groupError, setGroupError] = useState<string | null>(null)

  const loadAvailableGroups = useCallback(async (): Promise<void> => {
    setLoadingGroups(true)
    setGroupError(null)
    
    try {
      const apiResponse = await apiCall('/admin/groups')
      const { groups } = apiResponse.data
      // Extract group names
      const groupNames = groups.map((g: any) => g.groupName)
      setAvailableGroups(groupNames)
    } catch (error) {
      console.error('Error loading groups:', error)
      setGroupError(error instanceof Error ? error.message : 'Failed to load groups')
    } finally {
      setLoadingGroups(false)
    }
  }, [apiCall])

  const addUserToGroup = useCallback(async (userId: string, groupName: string) => {
    const apiResponse = await apiCall(
      `/admin/users/${encodeURIComponent(userId)}/groups/${encodeURIComponent(groupName)}`,
      { method: 'PUT' }
    )
    return apiResponse
  }, [apiCall])

  const removeUserFromGroup = useCallback(async (userId: string, groupName: string) => {
    const apiResponse = await apiCall(
      `/admin/users/${encodeURIComponent(userId)}/groups/${encodeURIComponent(groupName)}`,
      { method: 'DELETE' }
    )
    return apiResponse
  }, [apiCall])

  const loadGroupsData = useCallback(async () => {
    const apiResponse = await apiCall('/admin/groups')
    return apiResponse.data.groups
  }, [apiCall])

  const loadGroupUsers = useCallback(async (groupName: string) => {
    const apiResponse = await apiCall(`/admin/groups/${encodeURIComponent(groupName)}/users`)
    return apiResponse.data.users
  }, [apiCall])

  return {
    availableGroups,
    loadingGroups,
    groupError,
    loadAvailableGroups,
    addUserToGroup,
    removeUserFromGroup,
    loadGroupsData,
    loadGroupUsers
  }
}