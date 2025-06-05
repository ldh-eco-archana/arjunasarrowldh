import React from 'react'
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import LockResetIcon from '@mui/icons-material/LockReset'
import { User } from '../types'

interface UserCardProps {
  user: User
  onClick: () => void
  onEdit: (e: React.MouseEvent) => void
  onResetPassword: (e: React.MouseEvent) => void
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onClick,
  onEdit,
  onResetPassword
}) => {
  const getStatusColor = (): { bg: string; color: string } => {
    switch (user.status) {
      case 'CONFIRMED':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669' }
      case 'FORCE_CHANGE_PASSWORD':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }
      default:
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }
    }
  }

  const statusColors = getStatusColor()

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.12)',
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        {/* User Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: user.enabled 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              flexShrink: 0
            }}
          >
            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>
              {(user.givenName?.[0] || user.email?.[0] || user.username[0]).toUpperCase()}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: '1.1rem',
                mb: 0.5,
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
              variant="body2"
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
        </Box>

        {/* User Status */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={user.status.replace(/_/g, ' ')}
            size="small"
            sx={{
              backgroundColor: statusColors.bg,
              color: statusColors.color,
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        </Box>

        {/* User Details */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
            Created: {new Date(user.createdAt).toLocaleDateString()}
          </Typography>
          {user.groups && user.groups.length > 0 && (
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
                    height: 20
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={onEdit}
            sx={{
              backgroundColor: 'rgba(76, 81, 191, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(76, 81, 191, 0.2)',
              }
            }}
          >
            <EditIcon sx={{ fontSize: 18, color: '#4c51bf' }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={onResetPassword}
            sx={{
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(220, 38, 38, 0.2)',
              }
            }}
          >
            <LockResetIcon sx={{ fontSize: 18, color: '#dc2626' }} />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  )
}