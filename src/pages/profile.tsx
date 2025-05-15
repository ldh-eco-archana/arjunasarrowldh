import React, { useEffect, useState } from 'react'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import Head from 'next/head'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import { useRouter } from 'next/router'
import { getCurrentUser } from '@/lib/supabaseClient'
import { getUserProfile } from '@/lib/supabase-helpers'
import { User } from '@/types/database.types'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import SchoolIcon from '@mui/icons-material/School'
import LocationCityIcon from '@mui/icons-material/LocationCity'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'

const Profile: NextPageWithLayout = () => {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null)

  useEffect(() => {
    // Check for authenticated user and fetch profile
    const fetchUserData = async (): Promise<void> => {
      try {
        const currentUser = await getCurrentUser()
        
        if (!currentUser) {
          // Redirect to login if not authenticated
          router.push('/login')
          return
        }
        
        // Fetch user profile data from the users table
        const profile = await getUserProfile(currentUser.id)
        setUserProfile(profile)
        
        // Calculate days remaining if we have a subscription end date
        if (profile?.subscription_end_date) {
          const endDate = new Date(profile.subscription_end_date)
          const today = new Date()
          const timeDiff = endDate.getTime() - today.getTime()
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
          setDaysRemaining(daysDiff)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [router])

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Determine background color for the subscription status banner
  const getSubscriptionBannerStyles = (): { bgcolor: string; color: string } => {
    if (daysRemaining !== null) {
      if (daysRemaining <= 7) {
        // Critical - red background with white text
        return {
          bgcolor: 'error.dark',
          color: 'white'
        }
      } else if (daysRemaining <= 30) {
        // Warning - amber background with dark text
        return {
          bgcolor: 'warning.dark',
          color: 'white'
        }
      } else {
        // Good - green/blue background with white text
        return {
          bgcolor: 'primary.dark',
          color: 'white'
        }
      }
    } else {
      // Default - gray background
      return {
        bgcolor: 'grey.700',
        color: 'white'
      }
    }
  }

  const bannerStyles = getSubscriptionBannerStyles();

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
        <title>My Profile | Economics E-Learning Portal</title>
        <meta 
          name="description" 
          content="View and manage your profile information in the economics e-learning portal."
        />
      </Head>
      <Box sx={{ py: 6, backgroundColor: 'background.default' }}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 4 }}>
            My Profile
          </Typography>
          
          {/* Subscription Status Banner */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2,
              backgroundColor: bannerStyles.bgcolor,
              color: bannerStyles.color
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'medium', mb: 1 }}>
                  Subscription Status
                </Typography>
                <Typography variant="body1">
                  Your subscription {daysRemaining && daysRemaining > 0 ? 'will expire' : 'has expired'} on{' '}
                  <strong>{userProfile?.subscription_end_date ? formatDate(userProfile.subscription_end_date) : 'N/A'}</strong>
                </Typography>
              </Box>
              <Box sx={{ 
                textAlign: 'center', 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: 2, 
                p: 1.5, 
                minWidth: '100px' 
              }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {daysRemaining !== null ? daysRemaining : 'N/A'}
                </Typography>
                <Typography variant="body2">
                  days remaining
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Profile Information */}
          <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'primary.main', py: 3, px: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccountCircleIcon sx={{ fontSize: 50, color: 'white' }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                  {userProfile?.first_name} {userProfile?.last_name}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText 
                        primary="Email" 
                        secondary={userProfile?.email || 'N/A'} 
                      />
                    </ListItem>
                    <Divider component="li" />
                    
                    <ListItem>
                      <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText 
                        primary="Mobile" 
                        secondary={userProfile?.mobile || 'N/A'} 
                      />
                    </ListItem>
                    <Divider component="li" />
                    
                    <ListItem>
                      <LocationCityIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText 
                        primary="City" 
                        secondary={userProfile?.city || 'N/A'} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText 
                        primary="School Name" 
                        secondary={userProfile?.school_name || 'N/A'} 
                      />
                    </ListItem>
                    <Divider component="li" />
                    
                    <ListItem>
                      <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText 
                        primary="Class" 
                        secondary={userProfile?.current_class ? `Class ${userProfile.current_class}` : 'N/A'} 
                      />
                    </ListItem>
                    <Divider component="li" />
                    
                    <ListItem>
                      <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText 
                        primary="Board" 
                        secondary={userProfile?.board || 'N/A'} 
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Account created on {userProfile?.created_at ? formatDate(userProfile.created_at) : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  )
}

Profile.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default Profile 