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

interface CreateChapterDialogProps {
  open: boolean
  onClose: () => void
  courseId: string
  bookId: string
  bookTitle: string
  onCreateChapter: (title: string) => Promise<void>
  existingChaptersCount: number
}

export const CreateChapterDialog: React.FC<CreateChapterDialogProps> = ({
  open,
  onClose,
  courseId: _courseId,
  bookId: _bookId,
  bookTitle,
  onCreateChapter,
  existingChaptersCount: _existingChaptersCount
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
      setError('Chapter title is required')
      return
    }
    if (trimmedTitle.length > 200) {
      setError('Chapter title must be 200 characters or less')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onCreateChapter(trimmedTitle)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chapter')
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
          Create New Chapter
        </Typography>
        <Typography variant="body2" color="text.secondary">
          in {bookTitle}
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
            label="Chapter Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            required
            autoFocus
            placeholder="e.g., Introduction to Hydrocarbons"
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
          Create Chapter
        </Button>
      </DialogActions>
    </Dialog>
  )
}