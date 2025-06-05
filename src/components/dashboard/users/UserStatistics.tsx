import React from 'react'
import { Grid, Card, CardContent, Typography } from '@mui/material'
import { User } from '../types'

interface UserStatisticsProps {
  users: User[]
}

export const UserStatistics: React.FC<UserStatisticsProps> = ({ users }) => {
  const stats = [
    {
      value: users.length,
      label: 'Total Users',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      value: users.filter(u => u.status === 'CONFIRMED').length,
      label: 'Confirmed',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      value: users.filter(u => u.status === 'FORCE_CHANGE_PASSWORD').length,
      label: 'Pending Setup',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      value: users.filter(u => u.enabled).length,
      label: 'Enabled',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    }
  ]

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {stats.map((stat, index) => (
        <Grid item xs={6} sm={3} key={index}>
          <Card sx={{ 
            borderRadius: 3,
            background: stat.gradient,
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {stat.label}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}