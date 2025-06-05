import React, { useState, useEffect } from 'react'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import Head from 'next/head'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import { StyledButton } from '@/components/styled-button'
import Grid from '@mui/material/Grid'
import Link from 'next/link'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import { useRouter } from 'next/router'
import { confirmResetPassword } from '@/lib/cognitoClient'
import InputAdornment from '@mui/material/InputAdornment'
import LockIcon from '@mui/icons-material/Lock'
import Image from 'next/image'
import CircularProgress from '@mui/material/CircularProgress'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const ResetPassword: NextPageWithLayout = () => {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [validLink, setValidLink] = useState(true)
  const [confirmationCode, setConfirmationCode] = useState('')
  const [username, setUsername] = useState('')

  // Check if we have the necessary parameters for password reset
  useEffect(() => {
    // For Cognito, we expect URL parameters for confirmation code and username
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code') || urlParams.get('confirmation_code')
    const email = urlParams.get('email') || urlParams.get('username')
    
    if (!code || !email) {
      setValidLink(false)
      setError('Invalid or expired password reset link. Please request a new one.')
    } else {
      setConfirmationCode(code)
      setUsername(email)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError('')
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      // Confirm the password reset with Cognito
      const { error: resetError } = await confirmResetPassword(username, confirmationCode, password)

      if (resetError) {
        throw resetError
      }

      setSuccess(true)
      
      // Redirect to login after successful password reset
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error: unknown) {
      const err = error as Error
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Reset Password | Economics E-Learning Portal</title>
        <meta 
          name="description" 
          content="Reset your password for the economics e-learning portal. Create a new, secure password for your account."
        />
      </Head>
      <Box 
        sx={{ 
          py: 10, 
          backgroundColor: 'background.default',
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container maxWidth="md">
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ position: 'relative', height: '450px', borderRadius: 3, overflow: 'hidden', boxShadow: 5 }}>
                <Image 
                  src="/images/e-learning-portal/hero.png" 
                  alt="Economics E-Learning" 
                  layout="fill" 
                  objectFit="cover"
                />
                <Box sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0, 
                  backgroundColor: 'rgba(18, 124, 113, 0.75)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 4 
                }}>
                  <Typography variant="h3" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
                    Create New Password
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white', textAlign: 'center', mb: 4 }}>
                    Set a strong, secure password to protect your Economics E-Learning account.
                  </Typography>
                  <Link href="/login" passHref>
                    <StyledButton 
                      color="secondary" 
                      size="large" 
                      variant="contained"
                      startIcon={<ArrowBackIcon />}
                    >
                      Back to Login
                    </StyledButton>
                  </Link>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 5, p: { xs: 2, sm: 3 } }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography component="h1" variant="h4" align="center" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
                    Reset Password
                  </Typography>
                  
                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}
                  
                  {success ? (
                    <>
                      <Alert severity="success" sx={{ mb: 3 }}>
                        Password successfully reset!
                      </Alert>
                      <Typography variant="body2" sx={{ mb: 3 }}>
                        Your password has been updated. You will be redirected to the login page in a few seconds...
                      </Typography>
                      <Link href="/login" passHref>
                        <StyledButton
                          variant="contained"
                          color="primary"
                          size="large"
                          sx={{ width: '100%', mt: 2 }}
                        >
                          Go to Login
                        </StyledButton>
                      </Link>
                    </>
                  ) : validLink ? (
                    <Box component="form" onSubmit={handleSubmit}>
                      <Typography variant="body2" sx={{ mb: 3 }}>
                        Enter your new password below. Choose a strong password that you don&apos;t use for other websites.
                      </Typography>
                      
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="New Password"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm New Password"
                        type="password"
                        id="confirmPassword"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 2 }}
                      />
                      
                      <StyledButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{ width: '100%', mt: 3, mb: 2 }}
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                      </StyledButton>
                    </Box>
                  ) : (
                    <>
                      <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
                        This password reset link is invalid or has expired.
                      </Typography>
                      <Link href="/forgot-password" passHref>
                        <StyledButton
                          variant="contained"
                          color="primary"
                          size="large"
                          sx={{ width: '100%', mt: 2, mb: 2 }}
                        >
                          Request New Reset Link
                        </StyledButton>
                      </Link>
                      <Link href="/login" passHref>
                        <Typography component="a" variant="body2" sx={{ color: 'primary.main', textAlign: 'center', display: 'block', mt: 2 }}>
                          Back to Login
                        </Typography>
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  )
}

ResetPassword.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default ResetPassword 