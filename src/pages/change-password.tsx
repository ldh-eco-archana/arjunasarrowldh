import React, { useState } from 'react'
import { GetServerSideProps } from 'next'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import Head from 'next/head'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import { StyledButton } from '@/components/styled-button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import LockIcon from '@mui/icons-material/Lock'
import CircularProgress from '@mui/material/CircularProgress'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import { createClient } from '@/utils/supabase/client'
import { getSafeUser } from '@/utils/supabase/server'

interface ChangePasswordProps {
  email: string;
  error?: string;
}

const ChangePassword: NextPageWithLayout<ChangePasswordProps> = ({ email, error: serverError }) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(serverError || '')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError('')
    
    // Validate input
    if (currentPassword === newPassword) {
      setError('New password cannot be the same as your current password')
      return
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    setLoading(true)

    try {
      // Update the user's password using the new client
      const supabase = createClient()
      
      // First sign in with the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword
      })
      
      if (signInError) {
        throw new Error('Current password is incorrect')
      }
      
      // Then update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (updateError) {
        throw updateError
      }
      
      setSuccess(true)
      
      // Clear form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
    } catch (error: unknown) {
      const err = error as Error
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Change Password | Economics E-Learning Portal</title>
        <meta 
          name="description" 
          content="Change your account password securely in the economics e-learning portal."
        />
      </Head>
      <Box sx={{ py: 6, backgroundColor: 'background.default' }}>
        <Container maxWidth="sm">
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 4 }}>
            Change Password
          </Typography>
          
          <Card sx={{ borderRadius: 3, boxShadow: 5, p: { xs: 2, sm: 3 } }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Your password has been successfully updated!
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="currentPassword"
                  label="Current Password"
                  type="password"
                  id="currentPassword"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="newPassword"
                  label="New Password"
                  type="password"
                  id="newPassword"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Password must be at least 6 characters long"
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
                        <LockIcon color={confirmPassword === newPassword && newPassword ? 'success' : 'primary'} />
                      </InputAdornment>
                    ),
                  }}
                  error={confirmPassword !== '' && confirmPassword !== newPassword}
                  helperText={confirmPassword !== '' && confirmPassword !== newPassword ? 'Passwords do not match' : ''}
                  sx={{ mb: 2 }}
                />
                
                <StyledButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ width: '100%', mt: 3, mb: 2 }}
                  disabled={loading || success}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
                </StyledButton>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<ChangePasswordProps> = async (context) => {
  try {
    // Fast authentication check using JWT verification
    const { data: safeUser, error: authError } = await getSafeUser(context);

    if (authError || !safeUser) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    return {
      props: {
        email: safeUser.email || '',
      },
    };
  } catch (error) {
    console.error('Server-side error:', error);
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      }
    };
  }
};

ChangePassword.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default ChangePassword 