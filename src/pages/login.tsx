import React from 'react'
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

const Login: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Login | Economics E-Learning Portal</title>
        <meta 
          name="description" 
          content="Login to access your economics e-learning account. Comprehensive digital learning platform for economics students."
        />
      </Head>
      <Box sx={{ py: 12, backgroundColor: 'background.default' }}>
        <Container maxWidth="sm">
          <Card sx={{ borderRadius: 3, boxShadow: 5 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography component="h1" variant="h4" align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
                Login to Your Account
              </Typography>
              <Box component="form" sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
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
                />
                <StyledButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ width: '100%', mt: 3, mb: 2 }}
                >
                  Sign In
                </StyledButton>
                <Grid container>
                  <Grid item xs>
                    <Link href="#" passHref>
                      <Typography component="a" variant="body2" sx={{ color: 'primary.main' }}>
                        Forgot password?
                      </Typography>
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link href="/payment" passHref>
                      <Typography component="a" variant="body2" sx={{ color: 'primary.main' }}>
                        {"Don't have an account? Sign Up"}
                      </Typography>
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  )
}

Login.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default Login 