import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Divider
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import AttachmentIcon from '@mui/icons-material/Attachment'
import { Notification } from '../types'

interface ManageAttachmentsDialogProps {
  open: boolean
  onClose: () => void
  notification: Notification | null
  onDeleteAll: () => Promise<void>
  onDeleteSingle: (attachmentId: string) => Promise<void>
  onDownload: (attachment: any) => void
}

export const ManageAttachmentsDialog: React.FC<ManageAttachmentsDialogProps> = ({
  open,
  onClose,
  notification,
  onDeleteAll,
  onDeleteSingle,
  onDownload
}) => {
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!notification || !notification.attachments || notification.attachments.length === 0) {
    return null
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleDeleteAll = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await onDeleteAll()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete all attachments')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSingle = async (attachmentId: string): Promise<void> => {
    setDeletingId(attachmentId)
    setError(null)
    try {
      await onDeleteSingle(attachmentId)
      // The parent component will update the notification with the response
      // If there are no more attachments, the parent should close the dialog
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete attachment')
    } finally {
      setDeletingId(null)
    }
  }

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
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Manage Attachments
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {notification.title}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <List>
          {notification.attachments.map((attachment, index) => (
            <React.Fragment key={attachment.id}>
              {index > 0 && <Divider />}
              <ListItem sx={{ py: 2 }}>
                <AttachmentIcon sx={{ mr: 2, color: 'action.active' }} />
                <ListItemText
                  primary={attachment.fileName || attachment.filename || attachment.originalFilename || 'Unnamed file'}
                  secondary={
                    <Box>
                      {attachment.fileSize && (
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(attachment.fileSize)}
                        </Typography>
                      )}
                      {(attachment.contentType || attachment.fileType) && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          • {(attachment.contentType || attachment.fileType || '').split('/')[1]?.toUpperCase() || 'File'}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => onDownload(attachment)}
                    sx={{ mr: 1 }}
                  >
                    <DownloadIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteSingle(attachment.id)}
                    disabled={deletingId === attachment.id}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}
        </List>

        <Alert severity="info" sx={{ mt: 2 }}>
          Deleting attachments only removes them from the notification. The files will be automatically cleaned up later.
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} disabled={loading || !!deletingId}>
          Close
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDeleteAll}
          disabled={loading || !!deletingId}
        >
          {loading ? 'Deleting All...' : 'Delete All Attachments'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}