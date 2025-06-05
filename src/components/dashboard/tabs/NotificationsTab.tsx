import React from 'react'
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Skeleton,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant'
import WarningIcon from '@mui/icons-material/Warning'
import AddIcon from '@mui/icons-material/Add'
import { NotificationCard } from '../notifications/NotificationCard'
import { Notification, NotificationsResponse, CourseWithBooks } from '../types'

interface Attachment {
  id: string;
  fileName?: string;
  filename?: string;
  originalFilename?: string;
  fileSize?: number;
}

interface NotificationsTabProps {
  notifications: Notification[]
  loading: boolean
  error: string | null
  pagination: NotificationsResponse['pagination'] | null
  lastRefresh: Date | null
  refreshing: boolean
  onRefresh: () => void
  onLoadMore: () => void
  onAttachmentDownload: (attachment: Attachment) => void
  isAdmin?: boolean
  courses?: CourseWithBooks[]
  selectedCourseId?: string
  onCourseChange?: (courseId: string) => void
  onCreateNotification?: () => void
  onEditNotification?: (notification: Notification) => void
  onDeleteNotification?: (notification: Notification) => void
  onManageAttachments?: (notification: Notification) => void
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({
  notifications,
  loading,
  error,
  pagination,
  lastRefresh,
  refreshing,
  onRefresh,
  onLoadMore,
  onAttachmentDownload,
  isAdmin,
  courses,
  selectedCourseId,
  onCourseChange,
  onCreateNotification,
  onEditNotification,
  onDeleteNotification,
  onManageAttachments
}) => {
  const formatLastRefresh = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    
    return date.toLocaleString()
  }

  console.log('NotificationsTab render:', { loading, notificationsLength: notifications.length, error, isAdmin, selectedCourseId })
  
  return (
    <Box sx={{ mt: 4 }}>
      {/* Admin Controls: Course Selector & Create Notification Button */}
      {isAdmin && courses && courses.length > 0 && (
        <Box sx={{ 
          mb: 3, 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          width: '100%'
        }}>
          <FormControl sx={{ 
            minWidth: { xs: '100%', sm: 300 },
            width: { xs: '100%', sm: 'auto' }
          }}>
            <InputLabel>Select Course</InputLabel>
            <Select
              value={selectedCourseId || ''}
              onChange={(e) => onCourseChange?.(e.target.value)}
              label="Select Course"
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateNotification}
            disabled={!selectedCourseId}
            fullWidth
            sx={{
              backgroundColor: '#667eea',
              '&:hover': {
                backgroundColor: '#5a67d8',
              },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Create Notification
          </Button>
        </Box>
      )}
      
      {/* Show course name for non-admin users */}
      {!isAdmin && courses && courses.length > 0 && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(102, 126, 234, 0.1)', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: '#667eea', fontWeight: 600 }}>
            Notifications for: {courses[0]?.name}
          </Typography>
        </Box>
      )}
      
      {/* Main Content Area: Skeletons, Error, or Notifications List/Message */}
      {(() => {
        if (loading && notifications.length === 0 && !error) {
          // Skeletons for initial loading
          return (
            <Box sx={{ mt: 0 }}> {/* mt: 0 because headers are already rendered */}
              {[1, 2, 3].map((i) => (
                <Card key={i} sx={{ 
                  mb: 3,
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  overflow: 'hidden'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                      <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 3 }} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" sx={{ fontSize: '0.75rem', width: '20%', mb: 1 }} />
                        <Skeleton variant="text" sx={{ fontSize: '1.25rem', width: '70%', mb: 1 }} />
                      </Box>
                      <Skeleton variant="text" sx={{ fontSize: '0.75rem', width: '15%' }} />
                    </Box>
                    <Skeleton variant="text" sx={{ width: '100%', mb: 1 }} />
                    <Skeleton variant="text" sx={{ width: '90%', mb: 1 }} />
                    <Skeleton variant="text" sx={{ width: '80%' }} />
                  </CardContent>
                </Card>
              ))}
            </Box>
          );
        }

        if (error) {
          // Error Message
          return (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              px: 4,
              borderRadius: 4,
              border: '2px dashed rgba(220, 38, 38, 0.2)',
              bgcolor: 'rgba(220, 38, 38, 0.05)'
            }}>
              <WarningIcon sx={{ fontSize: 64, color: 'rgba(220, 38, 38, 0.5)', mb: 2 }} />
              <Typography variant="h6" color="error" sx={{ mb: 1, fontWeight: 600 }}>
                Failed to Load Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {error}
              </Typography>
              <Button
                variant="outlined"
                onClick={onRefresh}
                sx={{
                  borderColor: '#4c51bf',
                  color: '#4c51bf',
                  '&:hover': {
                    borderColor: '#4c51bf',
                    backgroundColor: 'rgba(76, 81, 191, 0.08)',
                  }
                }}
              >
                Try Again
              </Button>
            </Box>
          );
        }

        // If not initial loading and no error, display Refresh Header then List or "No items" message
        return (
          <>
            {/* Refresh Header */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 },
              mb: 3,
              pb: 2,
              borderBottom: '1px solid rgba(76, 81, 191, 0.1)'
            }}>
              <Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'rgba(0, 0, 0, 0.87)',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  Recent Notifications
                </Typography>
                {lastRefresh && (
                  <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                    Last updated {formatLastRefresh(lastRefresh)}
                  </Typography>
                )}
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={onRefresh}
                disabled={refreshing}
                startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
                sx={{
                  borderColor: '#4c51bf',
                  color: '#4c51bf',
                  alignSelf: { xs: 'flex-end', sm: 'auto' },
                  '&:hover': {
                    borderColor: '#4c51bf',
                    backgroundColor: 'rgba(76, 81, 191, 0.08)',
                  },
                  '&.Mui-disabled': {
                    borderColor: 'rgba(76, 81, 191, 0.3)',
                    color: 'rgba(76, 81, 191, 0.3)',
                  }
                }}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </Box>

            {notifications.length === 0 ? (
              // No Notifications Message
              <Box sx={{ 
                textAlign: 'center', 
                py: 8,
                px: 4,
                borderRadius: 4,
                border: '2px dashed rgba(76, 81, 191, 0.2)',
                bgcolor: 'rgba(76, 81, 191, 0.05)'
              }}>
                <NotificationImportantIcon sx={{ fontSize: 64, color: 'rgba(76, 81, 191, 0.5)', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  No Notifications Yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You&apos;ll see announcements, updates, and important information here when they&apos;re available.
                  {isAdmin && courses && courses.length > 0 && " Select a course above to view its notifications, or create a new one."}
                </Typography>
              </Box>
            ) : (
              // Notifications List + Load More Button
              <>
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.notificationId}
                    notification={notification}
                    onAttachmentDownload={onAttachmentDownload}
                    isAdmin={isAdmin}
                    onEdit={onEditNotification}
                    onDelete={onDeleteNotification}
                    onManageAttachments={onManageAttachments}
                  />
                ))}
                
                {pagination?.hasNextPage && (
                  <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Button
                      variant="outlined"
                      onClick={onLoadMore}
                      disabled={loading} // This loading is for "load more" action
                      sx={{
                        borderColor: '#4c51bf',
                        color: '#4c51bf',
                        '&:hover': {
                          borderColor: '#4c51bf',
                          backgroundColor: 'rgba(76, 81, 191, 0.08)',
                        },
                        '&.Mui-disabled': {
                          borderColor: 'rgba(76, 81, 191, 0.3)',
                          color: 'rgba(76, 81, 191, 0.3)',
                        }
                      }}
                      startIcon={loading && notifications.length > 0 ? <CircularProgress size={20} /> : undefined} // Show spinner only if loading more, not initial
                    >
                      {loading && notifications.length > 0 ? 'Loading...' : 'Load More Notifications'}
                    </Button>
                  </Box>
                )}
              </>
            )}
          </>
        );
      })()}
    </Box>
  )
}