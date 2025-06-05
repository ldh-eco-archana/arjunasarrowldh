import { useState, useCallback } from 'react'
import { useApiClient } from './useApiClient'
import { Notification } from '@/components/dashboard/types'

interface FileUploadRequest {
  filename: string
  fileSize: number
  contentType: string
}

interface UploadUrlResponse {
  uploadId: string
  urls: Array<{
    fileId: string
    filename: string
    uploadUrl: string
    s3Key: string
    expiresIn: number
  }>
}

interface NotificationCreateData {
  courseId: string
  title: string
  content: string
  priority: string
  fileAttachments?: Array<{
    fileId: string
    s3Key: string
    filename: string
    contentType: string
    fileSize: number
  }>
}

interface NotificationUpdateData {
  title: string
  content: string
  priority: string
}

interface NotificationManagementResult {
  loading: boolean;
  error: string | null;
  getUploadUrls: (files: FileUploadRequest[]) => Promise<UploadUrlResponse>;
  createNotification: (data: NotificationCreateData) => Promise<Notification>;
  updateNotification: (notificationId: string, data: NotificationUpdateData) => Promise<Notification>;
  deleteNotification: (notificationId: string) => Promise<void>;
  removeAllAttachments: (notificationId: string) => Promise<Notification>;
  removeAttachment: (notificationId: string, attachmentId: string) => Promise<Notification>;
}

export const useNotificationManagement = (): NotificationManagementResult => {
  const { apiCall } = useApiClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate presigned URLs for file uploads
  const getUploadUrls = useCallback(async (files: FileUploadRequest[]): Promise<UploadUrlResponse> => {
    try {
      const response = await apiCall('/notifications/attachments/upload-urls', {
        method: 'POST',
        body: JSON.stringify({ files })
      })

      return response.data
    } catch (err) {
      console.error('Failed to get upload URLs:', err)
      throw new Error(err instanceof Error ? err.message : 'Failed to generate upload URLs')
    }
  }, [apiCall])

  // Create a new notification
  const createNotification = useCallback(async (data: NotificationCreateData): Promise<Notification> => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiCall('/notifications', {
        method: 'POST',
        body: JSON.stringify(data)
      })

      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create notification'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  // Update notification (content and priority only)
  const updateNotification = useCallback(async (
    notificationId: string, 
    data: NotificationUpdateData
  ): Promise<Notification> => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiCall(`/notifications/${notificationId}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })

      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update notification'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const _response = await apiCall(`/notifications/${notificationId}`, {
        method: 'DELETE'
      })
      // For 204 No Content, response will be empty but successful
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  // Remove all attachments from a notification
  const removeAllAttachments = useCallback(async (notificationId: string): Promise<Notification> => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiCall(`/notifications/${notificationId}/attachments`, {
        method: 'DELETE'
      })

      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove attachments'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  // Remove a specific attachment from a notification
  const removeAttachment = useCallback(async (
    notificationId: string, 
    attachmentId: string
  ): Promise<Notification> => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiCall(`/notifications/${notificationId}/attachments/${attachmentId}`, {
        method: 'DELETE'
      })

      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove attachment'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  return {
    loading,
    error,
    getUploadUrls,
    createNotification,
    updateNotification,
    deleteNotification,
    removeAllAttachments,
    removeAttachment
  }
}