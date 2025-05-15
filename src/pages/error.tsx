import React from 'react'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import Head from 'next/head'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { StyledButton } from '@/components/styled-button'
import Link from 'next/link'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

const ErrorPage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Error | Economics E-Learning Portal</title>
        <meta 
          name="description" 
          content="An error occurred while processing your request."
        />
      </Head>
      <Box sx={{ py: 10, backgroundColor: 'background.default', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Container maxWidth="sm">
          <Card sx={{ borderRadius: 3, boxShadow: 5, p: { xs: 2, sm: 3 } }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
              <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
              <Typography component="h1" variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                Authentication Error
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                There was a problem with your authentication. This could be due to an invalid or expired link,
                or another issue with your account.
              </Typography>
              <Link href="/login" passHref>
                <StyledButton 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  sx={{ mb: 2 }}
                >
                  Return to Login
                </StyledButton>
              </Link>
              <Box sx={{ mt: 2 }}>
                <Link href="/" passHref>
                  <Typography component="a" variant="body2" sx={{ color: 'text.secondary' }}>
                    Return to Home Page
                  </Typography>
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  )
}

ErrorPage.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default ErrorPage 