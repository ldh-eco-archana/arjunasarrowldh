import React, { FC, ReactNode } from 'react'
import Box from '@mui/material/Box'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'

interface Props {
  children: ReactNode
  isAuthenticated?: boolean
}

const MainLayout: FC<Props> = ({ children, isAuthenticated = false }) => {
  return (
    <Box component="main">
      <Header isAuthenticated={isAuthenticated} />
      {children}
      <Footer />
    </Box>
  )
}

export default MainLayout
