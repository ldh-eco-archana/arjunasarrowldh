import React, { useEffect } from 'react'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import Head from 'next/head'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { useRouter } from 'next/router'

const Signup: NextPageWithLayout = () => {
  const router = useRouter()

  useEffect(() => {
    // Redirect to payment page after a short delay
    const redirectTimer = setTimeout(() => {
      router.push('/payment')
    }, 1500)

    return () => clearTimeout(redirectTimer)
  }, [router])

  return (
    <>
      <Head>
        <title>Sign Up | Economics E-Learning Portal</title>
        <meta 
          name="description" 
          content="Sign up for our economics e-learning platform. Access comprehensive study materials, video lectures, practice tests and expert support."
        />
      </Head>
      <Box sx={{ py: 12, backgroundColor: 'background.default', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 4 }} />
            <Typography component="h1" variant="h4" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
              Redirecting to Payment Page
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
              To create your account, you need to complete the payment process first.
              You will be redirected to our secure payment gateway...
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  )
}

Signup.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default Signup 