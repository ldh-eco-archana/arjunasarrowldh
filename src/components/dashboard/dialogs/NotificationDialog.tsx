import React, { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  useMediaQuery,
  useTheme
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CloseIcon from '@mui/icons-material/Close'
import { Notification } from '../types'

interface AttachmentFile {
  fileId: string
  filename: string
  fileSize: number
  contentType: string
  file?: File
  uploadProgress?: number
  uploaded?: boolean
  s3Key?: string
}

interface NotificationDialogProps {
  open: boolean
  onClose: () => void
  notification?: Notification | null
  courseId?: string
  onSave: (data: {
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
  }) => Promise<void>
  onUploadAttachments: (files: Array<{
    filename: string
    fileSize: number
    contentType: string
  }>) => Promise<{
    uploadId: string
    urls: Array<{
      fileId: string
      filename: string
      uploadUrl: string
      s3Key: string
      expiresIn: number
    }>
  }>
}

const MAX_FILES = 5
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_TOTAL_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_CONTENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png'
]

export const NotificationDialog: React.FC<NotificationDialogProps> = ({
  open,
  onClose,
  notification,
  courseId,
  onSave,
  onUploadAttachments
}) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM')
  const [attachments, setAttachments] = useState<AttachmentFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    if (notification) {
      setTitle(notification.title)
      setContent(notification.content)
      setPriority(notification.priority)
      // For edit mode, we can't retrieve existing attachments as files
      // This would need separate handling to display existing attachments
    } else {
      setTitle('')
      setContent('')
      setPriority('MEDIUM')
      setAttachments([])
    }
    setError(null)
  }, [notification, open])

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(event.target.files || [])
    
    // Validate file count
    if (attachments.length + files.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed`)
      return
    }

    // Validate file types and sizes
    const validFiles: AttachmentFile[] = []
    let totalSize = attachments.reduce((sum, att) => sum + att.fileSize, 0)

    for (const file of files) {
      if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Allowed types: PDF, Word, JPEG, PNG`)
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`File ${file.name} exceeds 10MB limit`)
        return
      }

      totalSize += file.size
      if (totalSize > MAX_TOTAL_SIZE) {
        setError('Total file size exceeds 50MB limit')
        return
      }

      validFiles.push({
        fileId: `temp-${Date.now()}-${Math.random()}`,
        filename: file.name,
        fileSize: file.size,
        contentType: file.type,
        file: file,
        uploadProgress: 0,
        uploaded: false
      })
    }

    setAttachments([...attachments, ...validFiles])
    setError(null)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveAttachment = (fileId: string): void => {
    setAttachments(attachments.filter(att => att.fileId !== fileId))
  }

  const uploadFiles = async (): Promise<AttachmentFile[]> => {
    const filesToUpload = attachments.filter(att => !att.uploaded && att.file)
    if (filesToUpload.length === 0) return []

    setUploadingFiles(true)
    setError(null)

    try {
      // Get presigned URLs
      const uploadData = await onUploadAttachments(
        filesToUpload.map(att => ({
          filename: att.filename,
          fileSize: att.fileSize,
          contentType: att.contentType
        }))
      )

      // Upload files and collect results
      const uploadedAttachments: AttachmentFile[] = []
      
      for (let i = 0; i < filesToUpload.length; i++) {
        const att = filesToUpload[i]
        const urlData = uploadData.urls[i]
        
        if (!urlData || !att.file) continue

        try {
          // Update progress to show uploading
          setAttachments(prev => prev.map(a => 
            a.fileId === att.fileId 
              ? { ...a, uploadProgress: 50 }
              : a
          ))

          // Upload to S3
          const response = await fetch(urlData.uploadUrl, {
            method: 'PUT',
            body: att.file,
            headers: {
              'Content-Type': att.contentType
            },
            mode: 'cors'
          })

          if (!response.ok) {
            console.error('S3 upload failed:', response.status, response.statusText)
            throw new Error(`Upload failed (${response.status}): ${response.statusText}`)
          }

          // Create the uploaded attachment object
          const uploadedAttachment = {
            ...att,
            fileId: urlData.fileId,
            s3Key: urlData.s3Key,
            uploaded: true,
            uploadProgress: 100
          }
          
          uploadedAttachments.push(uploadedAttachment)
          
          console.log('Successfully uploaded:', uploadedAttachment)
          
          // Update state
          setAttachments(prev => prev.map(a => 
            a.fileId === att.fileId ? uploadedAttachment : a
          ))
        } catch (err) {
          console.error(`Upload error for ${att.filename}:`, err)
          throw new Error(`Failed to upload ${att.filename}: ${err instanceof Error ? err.message : String(err)}`)
        }
      }
      
      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return uploadedAttachments
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files')
      throw err
    } finally {
      setUploadingFiles(false)
    }
  }

  const handleSubmit = async (): Promise<void> => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required')
      return
    }

    if (!courseId && !notification?.courseId) {
      setError('Course ID is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let allUploadedAttachments = attachments.filter(att => att.uploaded && att.s3Key)
      
      // Upload any pending files
      if (attachments.some(att => !att.uploaded && att.file)) {
        const newlyUploaded = await uploadFiles()
        // Merge newly uploaded with already uploaded
        allUploadedAttachments = [
          ...allUploadedAttachments,
          ...newlyUploaded
        ]
      }

      console.log('All uploaded attachments:', allUploadedAttachments)
      
      // Prepare attachment data
      const fileAttachments = allUploadedAttachments
        .filter(att => att.s3Key && att.fileId)
        .map(att => ({
          fileId: att.fileId,
          s3Key: att.s3Key as string,
          filename: att.filename,
          contentType: att.contentType,
          fileSize: att.fileSize
        }))

      console.log('Prepared fileAttachments:', fileAttachments)
      
      const payload = {
        courseId: courseId || notification?.courseId || '',
        title: title.trim(),
        content: content.trim(),
        priority,
        ...(fileAttachments.length > 0 && { fileAttachments })
      }
      
      console.log('Final payload to send:', JSON.stringify(payload, null, 2))
      
      await onSave(payload)

      // Reset form and close
      setTitle('')
      setContent('')
      setPriority('MEDIUM')
      setAttachments([])
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notification')
    } finally {
      setLoading(false)
    }
  }

  const isEdit = !!notification

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          overflow: 'visible',
          m: { xs: 0, sm: 2 }
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        pb: 2
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {isEdit ? 'Edit Notification' : 'Create Notification'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            inputProps={{ maxLength: 200 }}
            helperText={`${title.length}/200 characters`}
            sx={{
              '& .MuiInputLabel-root': {
                backgroundColor: 'white',
                px: 0.5
              }
            }}
          />

          <TextField
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            required
            multiline
            rows={4}
            inputProps={{ maxLength: 2000 }}
            helperText={`${content.length}/2000 characters`}
            sx={{
              '& .MuiInputLabel-root': {
                backgroundColor: 'white',
                px: 0.5
              }
            }}
          />

          <FormControl fullWidth>
            <InputLabel sx={{ backgroundColor: 'white', px: 0.5 }}>Priority</InputLabel>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              label="Priority"
            >
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="URGENT">Urgent</MenuItem>
            </Select>
          </FormControl>

          {/* Attachments section - only for new notifications */}
          {!isEdit && (
            <Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: { xs: 'flex-start', sm: 'center' }, 
                gap: 2, 
                mb: 2,
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Attachments
                </Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ALLOWED_CONTENT_TYPES.join(',')}
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AttachFileIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={attachments.length >= MAX_FILES || uploadingFiles}
                  >
                    Add Files
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Max {MAX_FILES} files, 10MB each, 50MB total
                  </Typography>
                </Box>
              </Box>

              {attachments.length > 0 && (
                <List dense sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                  {attachments.map((att) => (
                    <ListItem key={att.fileId}>
                      <ListItemText
                        primary={att.filename}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption">
                              {formatFileSize(att.fileSize)}
                            </Typography>
                            {att.uploaded && (
                              <Chip label="Uploaded" size="small" color="success" />
                            )}
                            {!att.uploaded && att.uploadProgress !== undefined && att.uploadProgress > 0 && (
                              <Chip 
                                label={`Uploading... ${att.uploadProgress}%`} 
                                size="small" 
                                color="primary" 
                              />
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveAttachment(att.fileId)}
                          disabled={uploadingFiles || (att.uploadProgress !== undefined && att.uploadProgress > 0)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}

              {uploadingFiles && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Uploading files...
                  </Typography>
                  <LinearProgress sx={{ mt: 1 }} />
                </Box>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: { xs: 2, sm: 3 }, 
        pt: 2,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 0 }
      }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          fullWidth={isMobile}
          sx={{ order: { xs: 2, sm: 1 } }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || uploadingFiles}
          fullWidth={isMobile}
          sx={{
            backgroundColor: '#667eea',
            '&:hover': {
              backgroundColor: '#5a67d8'
            },
            order: { xs: 1, sm: 2 }
          }}
        >
          {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}