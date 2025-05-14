import React, { useEffect, useState } from 'react'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import Head from 'next/head'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import { useRouter } from 'next/router'
import { getCurrentUser, signOut } from '@/lib/supabaseClient'
import Button from '@mui/material/Button'
import LogoutIcon from '@mui/icons-material/Logout'
import { User } from '@supabase/supabase-js'

const Dashboard: NextPageWithLayout = () => {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for authenticated user
    const checkUser = async (): Promise<void> => {
      try {
        const currentUser = await getCurrentUser()
        
        if (!currentUser) {
          // Redirect to login if not authenticated
          router.push('/login')
          return
        }
        
        setUser(currentUser)
      } catch (error) {
        console.error('Error checking authentication:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    
    checkUser()
  }, [router])

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <Box sx={{ py: 12, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" align="center">
            Loading...
          </Typography>
        </Container>
      </Box>
    )
  }

  return (
    <>
      <Head>
        <title>Dashboard | Economics E-Learning Portal</title>
        <meta 
          name="description" 
          content="Access your economics e-learning dashboard. View courses, progress, and learning materials."
        />
      </Head>
      <Box sx={{ py: 6, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Welcome to Your Dashboard
              </Typography>
              <Typography variant="h6" color="textSecondary">
                {user?.email}
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<LogoutIcon />}
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
                    My Courses
                  </Typography>
                  <Typography variant="body1">
                    Access your enrolled courses and track your progress.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Assignments
                  </Typography>
                  <Typography variant="body1">
                    View pending assignments and submission deadlines.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Performance
                  </Typography>
                  <Typography variant="body1">
                    Check your quiz scores and overall performance metrics.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  )
}

Dashboard.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default Dashboard 