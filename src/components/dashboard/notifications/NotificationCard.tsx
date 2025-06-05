import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Fade,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material'
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'
import InfoIcon from '@mui/icons-material/Info'
import WarningIcon from '@mui/icons-material/Warning'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import DownloadIcon from '@mui/icons-material/Download'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import FolderIcon from '@mui/icons-material/Folder'
import { Notification } from '../types'

interface Attachment {
  id: string;
  fileName?: string;
  filename?: string;
  originalFilename?: string;
  fileSize?: number;
}

interface NotificationCardProps {
  notification: Notification
  onAttachmentDownload: (attachment: Attachment) => void
  isAdmin?: boolean
  onEdit?: (notification: Notification) => void
  onDelete?: (notification: Notification) => void
  onManageAttachments?: (notification: Notification) => void
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onAttachmentDownload,
  isAdmin = false,
  onEdit,
  onDelete,
  onManageAttachments
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const getPriorityIcon = (): React.ReactNode => {
    switch (notification.priority) {
      case 'URGENT':
        return <PriorityHighIcon sx={{ fontSize: 20, color: 'white' }} />
      case 'HIGH':
        return <WarningIcon sx={{ fontSize: 20, color: 'white' }} />
      default:
        return <InfoIcon sx={{ fontSize: 20, color: 'white' }} />
    }
  }

  const getPriorityColor = (): string => {
    switch (notification.priority) {
      case 'URGENT':
        return '#dc2626'
      case 'HIGH':
        return '#f59e0b'
      case 'MEDIUM':
        return '#3b82f6'
      default:
        return '#6b7280'
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    
    return date.toLocaleDateString()
  }

  const isNewNotification = (): boolean => {
    const date = new Date(notification.createdAt)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    return diffInHours <= 6
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = (): void => {
    setAnchorEl(null)
  }

  const handleEdit = (): void => {
    handleMenuClose()
    onEdit?.(notification)
  }

  const handleDelete = (): void => {
    handleMenuClose()
    onDelete?.(notification)
  }

  const handleManageAttachments = (): void => {
    handleMenuClose()
    onManageAttachments?.(notification)
  }

  const renderAttachment = (attachment: Attachment): React.ReactNode => {
    return (
      <Box
        key={attachment.id}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          borderRadius: 2,
          border: '1px solid rgba(76, 81, 191, 0.2)',
          bgcolor: 'rgba(76, 81, 191, 0.05)',
          transition: 'all 0.2s ease-in-out',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'rgba(76, 81, 191, 0.1)',
            borderColor: 'rgba(76, 81, 191, 0.3)',
            transform: 'translateY(-1px)',
          }
        }}
        onClick={() => onAttachmentDownload(attachment)}
      >
        <Box
          sx={{
            width: { xs: 32, sm: 40 },
            height: { xs: 32, sm: 40 },
            borderRadius: 2,
            background: 'linear-gradient(135deg, #4c51bf 0%, #667eea 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AttachFileIcon sx={{ fontSize: { xs: 16, sm: 20 }, color: 'white' }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              color: 'rgba(0, 0, 0, 0.87)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {attachment.fileName || attachment.filename || attachment.originalFilename || 'Unnamed file'}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(0, 0, 0, 0.6)'
            }}
          >
            {attachment.fileSize ? `${(attachment.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
          </Typography>
        </Box>
        <IconButton
          size="small"
          sx={{
            backgroundColor: 'rgba(76, 81, 191, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(76, 81, 191, 0.2)',
            }
          }}
        >
          <DownloadIcon sx={{ fontSize: 18, color: '#4c51bf' }} />
        </IconButton>
      </Box>
    )
  }

  return (
    <Fade in={true} timeout={500}>
      <Card sx={{ 
        mb: 3,
        borderRadius: { xs: 2, sm: 4 },
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        '&:hover': {
          transform: { xs: 'none', sm: 'translateY(-4px)' },
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.12)',
        }
      }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${getPriorityColor()} 0%, ${getPriorityColor()}dd 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 24px ${getPriorityColor()}40`,
                flexShrink: 0,
              }}
            >
              {getPriorityIcon()}
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                {isNewNotification() && (
                  <Chip
                    label="NEW"
                    size="small"
                    sx={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.65rem',
                      height: 20,
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      '@keyframes pulse': {
                        '0%, 100%': {
                          opacity: 1,
                        },
                        '50%': {
                          opacity: 0.8,
                        },
                      },
                    }}
                  />
                )}
                <Chip
                  label={notification.priority}
                  size="small"
                  sx={{
                    backgroundColor: `${getPriorityColor()}20`,
                    color: getPriorityColor(),
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    height: 20,
                    textTransform: 'uppercase',
                  }}
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  <AccessTimeIcon sx={{ fontSize: 14 }} />
                  {formatDate(notification.createdAt)}
                </Typography>
              </Box>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  color: 'rgba(0, 0, 0, 0.87)',
                  mb: 1,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  wordBreak: 'break-word'
                }}
              >
                {notification.title}
              </Typography>
            </Box>

            {/* Admin Actions Menu */}
            {isAdmin && (
              <>
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                  sx={{
                    ml: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem onClick={handleEdit}>
                    <ListItemIcon>
                      <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Edit Content</ListItemText>
                  </MenuItem>
                  {notification.attachments && notification.attachments.length > 0 && (
                    <MenuItem onClick={handleManageAttachments}>
                      <ListItemIcon>
                        <FolderIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Manage Attachments</ListItemText>
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                      <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
                    </ListItemIcon>
                    <ListItemText>Delete Notification</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>

          {/* Content */}
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(0, 0, 0, 0.7)',
              lineHeight: 1.6,
              mb: notification.attachments && notification.attachments.length > 0 ? 3 : 0,
              whiteSpace: 'pre-wrap'
            }}
          >
            {notification.content}
          </Typography>

          {/* Attachments */}
          {notification.attachments && notification.attachments.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2,
              mt: 3,
              pt: 3,
              borderTop: '1px solid rgba(0, 0, 0, 0.08)'
            }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600,
                  color: 'rgba(0, 0, 0, 0.87)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: { xs: '0.875rem', sm: '0.875rem' }
                }}
              >
                <AttachFileIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: '#4c51bf' }} />
                Attachments ({notification.attachments.length})
              </Typography>
              {notification.attachments.map(renderAttachment)}
            </Box>
          )}
        </CardContent>
      </Card>
    </Fade>
  )
}