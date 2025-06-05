import { Course, Book, Chapter } from '@/types/database.types'

export interface CourseWithBooks extends Course {
  books: BookWithChapters[]
  progress: number
}

export interface BookWithChapters extends Book {
  chapters: Chapter[]
}

export interface Notification {
  notificationId: string
  courseId: string
  title: string
  content: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'ACTIVE' | 'ARCHIVED'
  createdAt: string
  createdBy: string
  createdByName?: string
  updatedAt?: string
  attachments?: NotificationAttachment[]
}

export interface NotificationAttachment {
  id: string
  filename?: string
  originalFilename?: string
  fileName?: string // For backward compatibility
  s3Key?: string
  contentType?: string
  fileType?: string // For backward compatibility
  fileSize?: number
  uploadedAt?: string
  uploadedBy?: string
  downloadUrl?: string
  fileUrl?: string // For backward compatibility
}

export interface NotificationsResponse {
  notifications: Notification[]
  pagination: {
    pageSize: number
    hasNextPage: boolean
    nextCursor?: string
  }
}

export interface User {
  username: string
  email?: string
  status: 'CONFIRMED' | 'FORCE_CHANGE_PASSWORD' | 'UNCONFIRMED' | 'RESET_REQUIRED'
  enabled: boolean
  createdAt: string
  lastModified: string
  givenName?: string
  familyName?: string
  groups?: string[]
}