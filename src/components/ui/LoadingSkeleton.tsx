import React from 'react'
import { Box, Skeleton, SxProps, Theme } from '@mui/material'

interface LoadingSkeletonProps {
  height?: number | string | object
  variant?: 'rectangular' | 'text' | 'circular'
  animation?: 'pulse' | 'wave' | false
  sx?: SxProps<Theme>
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  height = '70vh', 
  variant = 'rectangular',
  animation = 'wave',
  sx = {}
}) => {
  return (
    <Box sx={{ 
      width: '100%', 
      height,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      p: 2,
      ...sx
    }}>
      <Skeleton 
        variant={variant} 
        height="100%" 
        animation={animation}
        sx={{ borderRadius: 1 }}
      />
    </Box>
  )
}

export default LoadingSkeleton 