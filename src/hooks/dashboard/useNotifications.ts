import { useState, useCallback, useEffect } from 'react'
import { useApiClient } from './useApiClient'
import { Notification, NotificationsResponse } from '@/components/dashboard/types'

interface Attachment {
  id: string;
  fileName?: string;
  filename?: string;
  originalFilename?: string;
  fileSize?: number;
  downloadUrl?: string;
}

interface NotificationsHookReturn {
  notifications: Notification[];
  loadingNotifications: boolean;
  notificationsError: string | null;
  notificationsPagination: NotificationsResponse['pagination'] | null;
  refreshing: boolean;
  lastRefresh: Date | null;
  loadNotifications: (cursor?: string, isRefresh?: boolean, courseId?: string) => Promise<void>;
  handleAttachmentDownload: (attachment: Attachment) => Promise<void>;
  handleRefreshNotifications: () => void;
  handleLoadMore: () => void;
}

export const useNotifications = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any, 
  tabValue: number, 
  selectedCourseId?: string, 
  isAdmin = false
): NotificationsHookReturn => {
  // Hook initialized
  const { apiCall } = useApiClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [notificationsError, setNotificationsError] = useState<string | null>(null)
  const [notificationsPagination, setNotificationsPagination] = useState<NotificationsResponse['pagination'] | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const loadNotifications = useCallback(async (
    cursor?: string, 
    isRefresh = false,
    courseId?: string
  ): Promise<void> => {
    // Loading notifications
    // Don't load if user is null
    if (!user) return;
    
    // Set appropriate loading state
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoadingNotifications(true)
    }
    setNotificationsError(null)
    
    try {
      const queryParams = new URLSearchParams()
      if (cursor) {
        queryParams.append('cursor', cursor)
      }
      queryParams.append('pageSize', '10')
      
      // Only admin users need to specify courseId
      // Regular users automatically get notifications for their enrolled course
      if (isAdmin) {
        const effectiveCourseId = courseId || selectedCourseId
        if (effectiveCourseId) {
          queryParams.append('courseId', effectiveCourseId)
        }
      }
      
      const endpoint = `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      // Loading from API
      const apiResponse = await apiCall(endpoint)
      // Response received
      
      // Handle different response formats
      const responseData = apiResponse.data
      let newNotifications: Notification[] = []
      let pagination: NotificationsResponse['pagination'] | null = null
      
      if (responseData.notifications) {
        // Expected format
        newNotifications = responseData.notifications
        pagination = responseData.pagination
      } else if (Array.isArray(responseData)) {
        // Direct array response
        newNotifications = responseData as Notification[]
        pagination = { hasNextPage: false, pageSize: newNotifications.length }
      } else {
        // Unexpected response format
        throw new Error('Invalid response format')
      }
      
      // If cursor is provided and not refresh, append to existing notifications (pagination)
      // If refresh, replace all notifications
      if (cursor && !isRefresh) {
        setNotifications(prev => [...prev, ...newNotifications])
      } else {
        setNotifications(newNotifications)
      }
      
      setNotificationsPagination(pagination)
      setLastRefresh(new Date())
    } catch (error) {
      // Error loading notifications
      setNotificationsError(error instanceof Error ? error.message : 'Failed to load notifications')
    } finally {
      setLoadingNotifications(false)
      setRefreshing(false)
    }
  }, [apiCall, selectedCourseId, isAdmin, user])

  const handleAttachmentDownload = useCallback(async (attachment: Attachment) => {
    try {
      // Use the downloadUrl from the attachment
      if (attachment.downloadUrl) {
        window.open(attachment.downloadUrl, '_blank')
      } else {
        // No download URL available
        alert('Download URL not available')
      }
    } catch (error) {
      // Error downloading attachment
      alert('Failed to download attachment')
    }
  }, [])

  const handleRefreshNotifications = useCallback(() => {
    // Manual refresh triggered
    loadNotifications(undefined, true)
  }, [loadNotifications])

  const handleLoadMore = useCallback(() => {
    if (notificationsPagination?.nextCursor) {
      loadNotifications(notificationsPagination.nextCursor)
    }
  }, [notificationsPagination, loadNotifications])

  // Load notifications when tab changes to notifications or course changes
  useEffect(() => {
    // Notification load effect triggered
    // For regular users, load immediately when on notifications tab
    // For admin users, wait until courseId is selected
    if (tabValue === 1 && user) {
      if (!isAdmin || (isAdmin && selectedCourseId)) {
        // Loading notifications based on role
        // Clear existing notifications when course changes
        setNotifications([])
        setNotificationsPagination(null)
        // Load new notifications
        loadNotifications()
      }
    }
  }, [tabValue, user, selectedCourseId, isAdmin, loadNotifications])

  // Auto-refresh notifications every 30 seconds when on notifications tab
  useEffect(() => {
    if (tabValue === 1 && user && (!isAdmin || selectedCourseId)) {
      const interval = setInterval(() => {
        loadNotifications(undefined, true) // Refresh mode
      }, 30000) // 30 seconds

      return () => clearInterval(interval)
    }
  }, [tabValue, user, selectedCourseId, isAdmin, loadNotifications])

  // Refresh notifications when user comes back to the page
  useEffect(() => {
    const handleVisibilityChange = (): void => {
      if (!document.hidden && tabValue === 1 && user && (!isAdmin || selectedCourseId)) {
        // Only refresh if it's been more than 10 seconds since last refresh
        if (!lastRefresh || (new Date().getTime() - lastRefresh.getTime()) > 10000) {
          loadNotifications(undefined, true)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [tabValue, user, lastRefresh, selectedCourseId, isAdmin, loadNotifications])

  return {
    notifications,
    loadingNotifications,
    notificationsError,
    notificationsPagination,
    refreshing,
    lastRefresh,
    loadNotifications,
    handleAttachmentDownload,
    handleRefreshNotifications,
    handleLoadMore
  }
}