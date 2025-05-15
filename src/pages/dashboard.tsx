import React, { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import Head from 'next/head'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import LogoutIcon from '@mui/icons-material/Logout'
import { User } from '@/types/database.types'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Paper from '@mui/material/Paper'
import { createClient as createClientBrowser } from '@/utils/supabase/client'
import { createServerClient } from '@supabase/ssr'
import Alert from '@mui/material/Alert'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

interface DashboardProps {
  user: User | null
  error?: string
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

const Dashboard: NextPageWithLayout<DashboardProps> = ({ user, error }) => {
  const router = useRouter()
  const [tabValue, setTabValue] = useState(0)
  const [sessionStatus, setSessionStatus] = useState<string | null>(null)

  useEffect(() => {
    // Verify session on client-side as well
    const checkSession = async (): Promise<void> => {
      const supabase = createClientBrowser()
      const { data, error } = await supabase.auth.getSession()
      
      if (error || !data.session) {
        setSessionStatus('No valid session found. Redirecting...')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setSessionStatus('Session valid')
      }
    }
    
    checkSession()
  }, [router])

  const handleSignOut = async (): Promise<void> => {
    try {
      const supabase = createClientBrowser()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error signing out:', error)
        return
      }
      
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
    if (!user?.current_class || !user?.board) {
      return "No course information available"
    }
    
    return `Class ${user.current_class}${user.current_class === '12' ? 'th' : ''} - ${user.board}`
  }

  if (error) {
    return (
      <Box sx={{ py: 12, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" align="center" color="error">
            {error}
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
          {sessionStatus === 'No valid session found. Redirecting...' && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {sessionStatus}
            </Alert>
          )}
          
          <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Hi {user?.first_name || 'Student'}, welcome back!
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
              sx={{ whiteSpace: 'nowrap' }}
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

export const getServerSideProps: GetServerSideProps<DashboardProps> = async (context) => {
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
        set(name: string, value: string, _options: Record<string, unknown>) {
          res.setHeader('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`);
        },
        remove(name: string, _options: Record<string, unknown>) {
          res.setHeader('Set-Cookie', `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
        },
      },
    }
  );

  try {
    // Check for authenticated user with getUser() for improved security
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    // Fetch user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return {
        props: {
          user: null,
          error: 'Failed to load user profile',
        },
      };
    }

    return {
      props: {
        user: profile,
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

Dashboard.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default Dashboard 