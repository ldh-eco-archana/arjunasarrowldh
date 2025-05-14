import React, { useEffect, useState } from 'react'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import Head from 'next/head'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { getCurrentUser, signOut } from '@/lib/supabaseClient'
import Button from '@mui/material/Button'
import LogoutIcon from '@mui/icons-material/Logout'
import { User as AuthUser } from '@supabase/supabase-js'
import { getUserProfile } from '@/lib/supabase-helpers'
import { User } from '@/types/database.types'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Paper from '@mui/material/Paper'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps): JSX.Element {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

function a11yProps(index: number): { id: string; 'aria-controls': string } {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  }
}

const Dashboard: NextPageWithLayout = () => {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [tabValue, setTabValue] = useState(0)

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
        const profile = await getUserProfile()
        setUserProfile(profile)
      } catch (error) {
        console.error('Error checking authentication:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [router])

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue)
  }

  // Generate course description based on class and board
  const getCourseDescription = (): string => {
    if (!userProfile?.current_class || !userProfile?.board) {
      return "No course information available"
    }
    
    return `Class ${userProfile.current_class}${userProfile.current_class === '12' ? 'th' : ''} - ${userProfile.board}`
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
                Hi {userProfile?.first_name || 'Student'}, welcome back!
              </Typography>
              <Typography variant="h6" color="textSecondary">
                Course opted: {getCourseDescription()}
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

          <Paper sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="dashboard tabs"
                variant="fullWidth"
              >
                <Tab label="Course Content" {...a11yProps(0)} />
                <Tab label="Notifications" {...a11yProps(1)} />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Typography variant="body1">
                Your course content will appear here. This includes lessons, exercises, and study materials.
              </Typography>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Typography variant="body1">
                Your notifications will appear here. This includes announcements, updates, and important information.
              </Typography>
            </TabPanel>
          </Paper>
        </Container>
      </Box>
    </>
  )
}

Dashboard.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default Dashboard 