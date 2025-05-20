import React, { useState } from 'react'
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
import InputAdornment from '@mui/material/InputAdornment'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import Image from 'next/image'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import { createClient } from '@/utils/supabase/client'
import Backdrop from '@mui/material/Backdrop'
import { GetServerSideProps } from 'next'
import { createServerClient } from '@supabase/ssr'

const Login: NextPageWithLayout = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [redirecting, setRedirecting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        throw error
      }

      if (data?.user) {
        // Immediately indicate that we're redirecting
        setRedirecting(true)
        
        // Redirect to dashboard right away
        router.push('/dashboard')
      }
    } catch (error: unknown) {
      const err = error as Error
      setError(err.message || 'Invalid credentials')
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login | Economics E-Learning Portal</title>
        <meta 
          name="description" 
          content="Login to access your economics e-learning account. Comprehensive digital learning platform for economics students."
        />
      </Head>
      
      {/* Fullscreen redirect backdrop */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2 
        }}
        open={redirecting}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6">
          Preparing your dashboard...
        </Typography>
      </Backdrop>
      
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
                    Welcome Back
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white', textAlign: 'center', mb: 4 }}>
                    Access your economics learning materials, track your progress, and excel in your board exams.
                  </Typography>
                  <Link href="/payment" passHref>
                    <StyledButton 
                      color="secondary" 
                      size="large" 
                      variant="contained"
                    >
                      New Student? Join Now
                    </StyledButton>
                  </Link>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 5, p: { xs: 2, sm: 3 } }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography component="h1" variant="h4" align="center" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
                    Sign In
                  </Typography>
                  
                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}
                  
                  <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading || redirecting}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading || redirecting}
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
                      disabled={loading || redirecting}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </StyledButton>
                    
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <Link href="/forgot-password" passHref>
                          <Typography component="a" variant="body2" sx={{ color: 'primary.main', textAlign: 'center', display: 'block' }}>
                            Forgot password?
                          </Typography>
                        </Link>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Link href="/payment" passHref>
                          <Typography component="a" variant="body2" sx={{ color: 'primary.main', textAlign: 'center', display: 'block' }}>
                            New student? Don&apos;t have an account?
                          </Typography>
                        </Link>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        OR
                      </Typography>
                    </Divider>

                    <Link href="/" passHref>
                      <Typography component="a" variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block' }}>
                        Return to Home Page
                      </Typography>
                    </Link>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  )
}

// Server-side authentication check - similar to the dashboard page implementation
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res } = context;
  
  // Create server-side Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name: string) {
          return req.cookies[name];
        },
        set(name: string, value: string, _: Record<string, unknown>) {
          res.setHeader('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`);
        },
        remove(name: string, _: Record<string, unknown>) {
          res.setHeader('Set-Cookie', `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
        },
      },
    }
  );

  try {
    // Check for authenticated user with getUser()
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // User is already authenticated, redirect to dashboard
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        },
      };
    }

    // User is not authenticated, continue to login page
    return {
      props: {},
    };
  } catch (error) {
    console.error('Server-side auth error:', error);
    return {
      props: {},
    };
  }
};

Login.getLayout = (page) => <MainLayout isAuthenticated={false}>{page}</MainLayout>

export default Login 