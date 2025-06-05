import React from 'react'
import {
  Box,
  Typography,
  Grid,
  Button,
  Skeleton,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import WarningIcon from '@mui/icons-material/Warning'
import GroupIcon from '@mui/icons-material/Group'
import { GroupCard } from '../groups/GroupCard'

interface Group {
  groupName: string;
  description?: string;
  createdAt: string;
  userCount: number;
}

interface User {
  username: string;
  email?: string;
  givenName?: string;
  familyName?: string;
  status: string;
  enabled: boolean;
  groups?: string[];
}

interface GroupsTabProps {
  groups: Group[]
  loading: boolean
  error: string | null
  onRefresh: () => void
  onGroupClick: (group: Group) => void
}

interface GroupUsersDialogProps {
  open: boolean
  group: Group | null
  users: User[]
  loading: boolean
  onClose: () => void
}

const GroupUsersDialog: React.FC<GroupUsersDialogProps> = ({
  open,
  group,
  users,
  loading,
  onClose
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontWeight: 700
      }}>
        {group?.groupName} - Group Members
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <GroupIcon sx={{ fontSize: 64, color: 'rgba(0, 0, 0, 0.3)', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No users in this group
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {users.map((user) => (
              <Grid item xs={12} sm={6} key={user.username}>
                <Card sx={{ 
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.1)'
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: user.enabled 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Typography sx={{ color: 'white', fontWeight: 700 }}>
                          {(user.givenName?.[0] || user.email?.[0] || user.username[0]).toUpperCase()}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {user.givenName && user.familyName 
                            ? `${user.givenName} ${user.familyName}`
                            : user.email || user.username}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(0, 0, 0, 0.6)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {user.email || user.username}
                        </Typography>
                      </Box>
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
                          fontSize: '0.65rem',
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export const GroupsTab: React.FC<GroupsTabProps & {
  selectedGroup: Group | null
  groupUsers: User[]
  loadingGroupUsers: boolean
  onGroupDialogClose: () => void
}> = ({
  groups,
  loading,
  error,
  onRefresh,
  onGroupClick,
  selectedGroup,
  groupUsers,
  loadingGroupUsers,
  onGroupDialogClose
}) => {
  if (loading && groups.length === 0) {
    return (
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card sx={{ 
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Skeleton variant="text" sx={{ fontSize: '1.5rem', width: '70%', mb: 1 }} />
                  <Skeleton variant="text" sx={{ fontSize: '0.875rem', width: '50%', mb: 2 }} />
                  <Skeleton variant="text" sx={{ fontSize: '0.875rem', width: '40%' }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        py: 8,
        px: 4,
        borderRadius: 4,
        border: '2px dashed rgba(220, 38, 38, 0.2)',
        bgcolor: 'rgba(220, 38, 38, 0.05)'
      }}>
        <WarningIcon sx={{ fontSize: 64, color: 'rgba(220, 38, 38, 0.5)', mb: 2 }} />
        <Typography variant="h6" color="error" sx={{ mb: 1, fontWeight: 600 }}>
          Failed to Load Groups
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Button
          variant="outlined"
          onClick={onRefresh}
          sx={{
            borderColor: '#4c51bf',
            color: '#4c51bf',
            '&:hover': {
              borderColor: '#4c51bf',
              backgroundColor: 'rgba(76, 81, 191, 0.08)',
            }
          }}
        >
          Try Again
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 4 }}>
      {/* Groups Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Group Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          sx={{
            borderColor: '#4c51bf',
            color: '#4c51bf',
            '&:hover': {
              borderColor: '#4c51bf',
              backgroundColor: 'rgba(76, 81, 191, 0.08)',
            }
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Groups Grid */}
      <Grid container spacing={3}>
        {groups.map((group) => (
          <Grid item xs={12} sm={6} md={4} key={group.groupName}>
            <GroupCard
              group={group}
              onClick={() => onGroupClick(group)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Group Users Dialog */}
      <GroupUsersDialog
        open={!!selectedGroup}
        group={selectedGroup}
        users={groupUsers}
        loading={loadingGroupUsers}
        onClose={onGroupDialogClose}
      />
    </Box>
  )
}