import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Alert,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { User } from '../types'

interface GroupManagementDialogProps {
  open: boolean
  user: User | null
  availableGroups: string[]
  selectedGroup: string
  loading: boolean
  loadingGroups: boolean
  error: string | null
  onClose: () => void
  onGroupSelect: (group: string) => void
  onAddToGroup: () => void
  onRemoveFromGroup: (group: string) => void
}

export const GroupManagementDialog: React.FC<GroupManagementDialogProps> = ({
  open,
  user,
  availableGroups,
  selectedGroup,
  loading,
  loadingGroups,
  error,
  onClose,
  onGroupSelect,
  onAddToGroup,
  onRemoveFromGroup
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
        fontWeight: 700
      }}>
        Manage Groups for {user.email || user.username}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Single Group Policy:</strong> Users can only belong to one group at a time. 
            Adding a user to a new group will automatically remove them from their current group.
          </Typography>
        </Alert>
        
        {user.groups && user.groups.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Current Groups
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {user.groups.map((group, index) => (
                <Chip
                  key={index}
                  label={group}
                  size="small"
                  onDelete={() => {
                    if (confirm(`Remove user from group ${group}?`)) {
                      onRemoveFromGroup(group)
                    }
                  }}
                  sx={{
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    fontSize: '0.7rem',
                    '& .MuiChip-deleteIcon': {
                      color: '#667eea',
                      fontSize: '1rem',
                      '&:hover': {
                        color: '#5a67d8',
                      }
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
        
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Add to Group
          </Typography>
          {loadingGroups ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={40} />
            </Box>
          ) : (
            <>
              <FormControl fullWidth margin="dense">
                <InputLabel>Select Group</InputLabel>
                <Select
                  value={selectedGroup}
                  onChange={(e) => onGroupSelect(e.target.value)}
                  label="Select Group"
                  disabled={loading}
                >
                  {availableGroups
                    .filter(group => !user.groups?.includes(group))
                    .map(group => (
                      <MenuItem key={group} value={group}>
                        {group}
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
              <Button
                fullWidth
                variant="contained"
                onClick={onAddToGroup}
                disabled={!selectedGroup || loading}
                sx={{
                  mt: 2,
                  backgroundColor: '#667eea',
                  '&:hover': {
                    backgroundColor: '#5a67d8',
                  }
                }}
              >
                {loading ? 'Moving to Group...' : user.groups && user.groups.length > 0 ? 'Move to Group' : 'Add to Group'}
              </Button>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={onClose}
          disabled={loading}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}