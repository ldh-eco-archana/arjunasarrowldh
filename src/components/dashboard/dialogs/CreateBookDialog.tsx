import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  Typography
} from '@mui/material'

interface CreateBookDialogProps {
  open: boolean
  onClose: () => void
  courseId: string
  courseName: string
  onCreateBook: (title: string) => Promise<void>
  existingBooksCount: number
}

export const CreateBookDialog: React.FC<CreateBookDialogProps> = ({
  open,
  onClose,
  courseId: _courseId,
  courseName,
  onCreateBook,
  existingBooksCount: _existingBooksCount
}) => {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = (): void => {
    if (!loading) {
      setTitle('')
      setError(null)
      onClose()
    }
  }

  const handleCreate = async (): Promise<void> => {
    // Validation
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Book title is required')
      return
    }
    if (trimmedTitle.length > 200) {
      setError('Book title must be 200 characters or less')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onCreateBook(trimmedTitle)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create book')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCreate()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Create New Book
        </Typography>
        <Typography variant="body2" color="text.secondary">
          in {courseName}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextField
            label="Book Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            required
            autoFocus
            placeholder="e.g., Organic Chemistry"
            inputProps={{
              maxLength: 200
            }}
            helperText={`${title.length}/200 characters`}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          disabled={loading || !title.trim()}
          variant="contained"
          sx={{
            backgroundColor: '#667eea',
            '&:hover': {
              backgroundColor: '#5a67d8'
            }
          }}
        >
          Create Book
        </Button>
      </DialogActions>
    </Dialog>
  )
}