import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'
import { Notification } from '../types'

interface DeleteNotificationDialogProps {
  open: boolean
  onClose: () => void
  notification: Notification | null
  onConfirm: () => Promise<void>
  loading?: boolean
}

export const DeleteNotificationDialog: React.FC<DeleteNotificationDialogProps> = ({
  open,
  onClose,
  notification,
  onConfirm,
  loading: externalLoading = false
}) => {
  const [internalLoading, setInternalLoading] = useState(false)
  const loading = externalLoading || internalLoading
  
  const handleConfirm = async (): Promise<void> => {
    setInternalLoading(true)
    try {
      await onConfirm()
    } finally {
      setInternalLoading(false)
    }
  }
  
  if (!notification) return null

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        pb: 1
      }}>
        <WarningIcon sx={{ color: 'error.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Delete Notification
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This action cannot be undone. The notification will be permanently deleted.
        </Alert>
        
        <Box sx={{ 
          p: 2, 
          bgcolor: 'grey.50', 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            {notification.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}>
            {notification.content}
          </Typography>
          {notification.attachments && notification.attachments.length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {notification.attachments.length} attachment{notification.attachments.length > 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}