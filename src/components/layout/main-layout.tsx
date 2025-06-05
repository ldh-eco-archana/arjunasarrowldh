import React, { FC, ReactNode } from 'react'
import Box from '@mui/material/Box'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'

interface Props {
  children: ReactNode
  isAuthenticated?: boolean
  theme?: string
}

const MainLayout: FC<Props> = ({ children, isAuthenticated = false, theme }) => {
  return (
    <Box component="main">
      <Header isAuthenticated={isAuthenticated} theme={theme} />
      {children}
      <Footer theme={theme} />
    </Box>
  )
}

export default MainLayout
