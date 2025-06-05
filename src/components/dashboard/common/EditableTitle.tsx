import React, { useState, useEffect, useRef } from 'react'
import {
  Typography,
  TextField,
  IconButton,
  Box,
  ClickAwayListener,
  CircularProgress,
  Tooltip
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

interface EditableTitleProps {
  title: string
  onSave: (newTitle: string) => Promise<void>
  variant?: 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2'
  disabled?: boolean
  maxLength?: number
  minLength?: number
}

export const EditableTitle: React.FC<EditableTitleProps> = ({
  title,
  onSave,
  variant = 'h6',
  disabled = false,
  maxLength = 200,
  minLength = 1
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(title)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditValue(title)
  }, [title])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleStartEdit = (e?: React.MouseEvent): void => {
    if (e) {
      e.stopPropagation()
    }
    if (!disabled) {
      setIsEditing(true)
      setError(null)
    }
  }

  const handleCancel = (): void => {
    setIsEditing(false)
    setEditValue(title)
    setError(null)
  }

  const handleSave = async (): Promise<void> => {
    // Validation
    const trimmedValue = editValue.trim()
    if (trimmedValue.length < minLength) {
      setError(`Title must be at least ${minLength} character${minLength > 1 ? 's' : ''}`)
      return
    }
    if (trimmedValue.length > maxLength) {
      setError(`Title must be no more than ${maxLength} characters`)
      return
    }

    // No change
    if (trimmedValue === title) {
      setIsEditing(false)
      return
    }

    setSaving(true)
    setError(null)
    
    try {
      await onSave(trimmedValue)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <ClickAwayListener onClickAway={handleCancel}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: { xs: 0.5, sm: 1 },
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          width: '100%'
        }}>
          <TextField
            inputRef={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            size="small"
            error={!!error}
            helperText={error}
            disabled={saving}
            fullWidth
            inputProps={{
              maxLength: maxLength
            }}
            sx={{
              flex: 1,
              minWidth: { xs: '100%', sm: 'auto' },
              '& .MuiInputBase-input': {
                fontSize: {
                  xs: variant === 'h4' ? '1.5rem' :
                      variant === 'h5' ? '1.25rem' :
                      variant === 'h6' ? '1.1rem' :
                      variant === 'subtitle1' ? '0.875rem' :
                      variant === 'subtitle2' ? '0.75rem' :
                      '0.875rem',
                  sm: variant === 'h4' ? '2.125rem' :
                      variant === 'h5' ? '1.5rem' :
                      variant === 'h6' ? '1.25rem' :
                      variant === 'subtitle1' ? '1rem' :
                      variant === 'subtitle2' ? '0.875rem' :
                      '1rem'
                },
                fontWeight: variant.startsWith('h') ? 500 : 400,
                padding: { xs: '6px 8px', sm: '8.5px 14px' }
              },
              '& .MuiFormHelperText-root': {
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                marginLeft: { xs: 0, sm: '14px' }
              }
            }}
          />
          <Box sx={{ 
            display: 'flex', 
            gap: 0.5,
            marginTop: { xs: 0, sm: 0 },
            marginLeft: { xs: 'auto', sm: 0 }
          }}>
            <IconButton
              size="small"
              onClick={handleSave}
              disabled={saving}
              sx={{ 
                color: 'success.main',
                padding: { xs: '4px', sm: '8px' }
              }}
            >
              {saving ? <CircularProgress size={16} /> : <CheckIcon fontSize="small" />}
            </IconButton>
            <IconButton
              size="small"
              onClick={handleCancel}
              disabled={saving}
              sx={{ 
                color: 'error.main',
                padding: { xs: '4px', sm: '8px' }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </ClickAwayListener>
    )
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: { xs: 0.5, sm: 1 },
      width: '100%'
    }}>
      <Typography 
        variant={variant} 
        component="span"
        sx={{
          fontSize: {
            xs: variant === 'h4' ? '1.5rem' :
                variant === 'h5' ? '1.25rem' :
                variant === 'h6' ? '1.1rem' :
                variant === 'subtitle1' ? '0.875rem' :
                variant === 'subtitle2' ? '0.75rem' :
                '0.875rem',
            sm: 'inherit'
          },
          lineHeight: 1.3
        }}
      >
        {title}
      </Typography>
      {!disabled && (
        <Tooltip title="Edit title">
          <IconButton
            size="small"
            onClick={handleStartEdit}
            sx={{
              opacity: 0.7,
              padding: { xs: '4px', sm: '8px' },
              '&:hover': { opacity: 1 }
            }}
          >
            <EditIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  )
}