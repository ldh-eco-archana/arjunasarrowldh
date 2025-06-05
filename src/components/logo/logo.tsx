import React, { FC } from 'react'
import { Box, Typography } from '@mui/material'

interface Props {
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  theme?: string
}

const Logo: FC<Props> = ({ onClick, variant = 'primary', theme }) => {
  const isDashboardTheme = theme === 'dashboard';
  const logoColor = isDashboardTheme ? '#4c51bf' : (variant === 'primary' ? 'primary.main' : 'unset');
  
  return (
    <Box onClick={onClick}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ 
          fontWeight: 700, 
          '& span': { color: logoColor },
          whiteSpace: 'nowrap'
        }}
      >
        Arjuna&apos;s<span> Arrow</span>
      </Typography>
    </Box>
  )
}

export default Logo
