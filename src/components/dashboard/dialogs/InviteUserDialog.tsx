import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { CourseWithBooks } from '../types'

interface InviteUserDialogProps {
  open: boolean
  onClose: () => void
  formData: {
    email: string
    givenName: string
    familyName: string
    groupName: string
  }
  onFormChange: (data: any) => void
  onInvite: () => void
  loading: boolean
  error: string | null
  courses: CourseWithBooks[]
}

export const InviteUserDialog: React.FC<InviteUserDialogProps> = ({
  open,
  onClose,
  formData,
  onFormChange,
  onInvite,
  loading,
  error,
  courses
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontWeight: 700
      }}>
        Invite New User
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          margin="dense"
          label="Email Address"
          type="email"
          fullWidth
          required
          value={formData.email}
          onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="First Name"
          fullWidth
          required
          value={formData.givenName}
          onChange={(e) => onFormChange({ ...formData, givenName: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Last Name"
          fullWidth
          required
          value={formData.familyName}
          onChange={(e) => onFormChange({ ...formData, familyName: e.target.value })}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth margin="dense" required>
          <InputLabel>Course Group</InputLabel>
          <Select
            value={formData.groupName}
            onChange={(e) => onFormChange({ ...formData, groupName: e.target.value })}
            label="Course Group"
          >
            {courses.map(course => (
              <MenuItem key={course.id} value={`2025_${course.id}`}>
                {course.name}
              </MenuItem>
            ))}
            <MenuItem value="Admin">Admin</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={onInvite}
          variant="contained"
          disabled={loading || !formData.email || !formData.givenName || !formData.familyName || !formData.groupName}
          sx={{
            backgroundColor: '#667eea',
            '&:hover': {
              backgroundColor: '#5a67d8',
            }
          }}
        >
          {loading ? 'Inviting...' : 'Invite User'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}