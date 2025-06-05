import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
} from '@mui/material'
import LockResetIcon from '@mui/icons-material/LockReset'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import { User } from '../types'

interface UserDetailsDialogProps {
  open: boolean
  user: User | null
  editMode: boolean
  editFormData: {
    email: string
    givenName: string
    familyName: string
  }
  updateError: string | null
  updateLoading: boolean
  onClose: () => void
  onEditModeToggle: () => void
  onEditFormChange: (data: any) => void
  onUpdateUser: () => void
  onResetPassword: () => void
  onSetTempPassword: () => void
  onManageGroups: () => void
}

export const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  open,
  user,
  editMode,
  editFormData,
  updateError,
  updateLoading,
  onClose,
  onEditModeToggle,
  onEditFormChange,
  onUpdateUser,
  onResetPassword,
  onSetTempPassword,
  onManageGroups
}) => {
  if (!user) return null

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
        fontWeight: 700,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        User Details
        {!editMode && (
          <Button
            size="small"
            variant="outlined"
            onClick={onEditModeToggle}
            sx={{
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Edit
          </Button>
        )}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {updateError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {updateError}
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Username
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(0, 0, 0, 0.7)' }}>
            {user.username}
          </Typography>
        </Box>
        
        {editMode ? (
          <>
            <TextField
              margin="dense"
              label="Email Address"
              type="email"
              fullWidth
              value={editFormData.email}
              onChange={(e) => onEditFormChange({ ...editFormData, email: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="First Name"
              fullWidth
              value={editFormData.givenName}
              onChange={(e) => onEditFormChange({ ...editFormData, givenName: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Last Name"
              fullWidth
              value={editFormData.familyName}
              onChange={(e) => onEditFormChange({ ...editFormData, familyName: e.target.value })}
              sx={{ mb: 2 }}
            />
          </>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Email
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                {user.email || 'Not provided'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Name
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                {user.givenName || user.familyName 
                  ? `${user.givenName || ''} ${user.familyName || ''}`.trim()
                  : 'Not provided'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Status
              </Typography>
              <Chip
                label={user.status.replace(/_/g, ' ')}
                size="small"
                sx={{
                  backgroundColor: 
                    user.status === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.1)' :
                    user.status === 'FORCE_CHANGE_PASSWORD' ? 'rgba(245, 158, 11, 0.1)' :
                    'rgba(239, 68, 68, 0.1)',
                  color: 
                    user.status === 'CONFIRMED' ? '#059669' :
                    user.status === 'FORCE_CHANGE_PASSWORD' ? '#d97706' :
                    '#dc2626',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Groups
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={onManageGroups}
                  sx={{
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 1.5,
                    borderColor: '#667eea',
                    color: '#667eea',
                    '&:hover': {
                      borderColor: '#667eea',
                      backgroundColor: 'rgba(102, 126, 234, 0.08)',
                    }
                  }}
                >
                  Manage Groups
                </Button>
              </Box>
              {user.groups && user.groups.length > 0 ? (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {user.groups.map((group, index) => (
                    <Chip
                      key={index}
                      label={group}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        color: '#667eea',
                        fontSize: '0.7rem',
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                  No groups assigned
                </Typography>
              )}
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Created
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                {new Date(user.createdAt).toLocaleString()}
              </Typography>
            </Box>
            
            {!editMode && (
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<LockResetIcon />}
                  onClick={onResetPassword}
                  sx={{
                    borderColor: '#dc2626',
                    color: '#dc2626',
                    '&:hover': {
                      borderColor: '#dc2626',
                      backgroundColor: 'rgba(220, 38, 38, 0.08)',
                    }
                  }}
                >
                  Reset Password
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<VpnKeyIcon />}
                  onClick={onSetTempPassword}
                  sx={{
                    borderColor: '#4c51bf',
                    color: '#4c51bf',
                    '&:hover': {
                      borderColor: '#4c51bf',
                      backgroundColor: 'rgba(76, 81, 191, 0.08)',
                    }
                  }}
                >
                  Set Temp Password
                </Button>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={onClose}
          disabled={updateLoading}
        >
          {editMode ? 'Cancel' : 'Close'}
        </Button>
        {editMode && (
          <Button 
            onClick={onUpdateUser}
            variant="contained"
            disabled={updateLoading}
            sx={{
              backgroundColor: '#667eea',
              '&:hover': {
                backgroundColor: '#5a67d8',
              }
            }}
          >
            {updateLoading ? 'Updating...' : 'Save Changes'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}