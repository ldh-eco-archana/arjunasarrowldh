import React, { useState, useEffect } from 'react'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import Head from 'next/head'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import SchoolIcon from '@mui/icons-material/School'
import EmailIcon from '@mui/icons-material/Email'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import ClassIcon from '@mui/icons-material/Class'
import BookIcon from '@mui/icons-material/Book'
import { useAuth } from '@/contexts/AuthContext'
import CircularProgress from '@mui/material/CircularProgress'
import { useRouter } from 'next/router'
import Chip from '@mui/material/Chip'

interface ParsedGroupInfo {
  year: string | null
  class: string | null
  board: string | null
  isAdmin: boolean
}

const Profile: NextPageWithLayout = () => {
  const _router = useRouter()
  const { user: currentUser, isLoading } = useAuth()
  const [error, _setError] = useState<string | null>(null)
  const [groupInfo, setGroupInfo] = useState<ParsedGroupInfo>({
    year: null,
    class: null,
    board: null,
    isAdmin: false
  })

  // Function to parse group information
  const parseGroupInfo = (groups: string[]): ParsedGroupInfo => {
    const info: ParsedGroupInfo = {
      year: null,
      class: null,
      board: null,
      isAdmin: false
    }

    for (const group of groups) {
      if (group.toLowerCase() === 'admin') {
        info.isAdmin = true
        break
      }
      
      // Parse format: YYYY_Class_Board (e.g., 2025_XI_CBSE, 2025_XII_ICSE)
      const groupPattern = /^(\d{4})_([XI]+)_([A-Z]+)$/
      const match = group.match(groupPattern)
      
      if (match) {
        info.year = match[1]
        info.class = match[2]
        info.board = match[3]
        break
      }
    }
    
    return info
  }

  useEffect(() => {
    if (currentUser) {
      // Parse group information from Cognito user
      const userGroups = currentUser.groups || []
      const parsedGroupInfo = parseGroupInfo(userGroups)
      setGroupInfo(parsedGroupInfo)
    }
  }, [currentUser])


  // Get user's full name from Cognito attributes
  const getFullName = (): string => {
    const givenName = currentUser?.attributes?.['given_name'] || ''
    const familyName = currentUser?.attributes?.['family_name'] || ''
    return `${givenName} ${familyName}`.trim() || 'User'
  }

  // Get user's email from Cognito attributes
  const getEmail = (): string => {
    return (currentUser?.email || currentUser?.attributes?.['email'] || 'N/A') as string
  }

  if (isLoading) {
    return (
      <Box sx={{ py: 12, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <CircularProgress size={60} sx={{ mb: 2, color: '#4c51bf' }} />
            <Typography variant="h6">Loading profile...</Typography>
          </Box>
        </Container>
      </Box>
    )
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
          
          {/* User Role Banner */}
          {groupInfo.isAdmin && (
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                mb: 4, 
                borderRadius: 4,
                background: 'linear-gradient(135deg, #4c51bf 0%, #667eea 100%)',
                color: 'white',
                boxShadow: '0 8px 32px rgba(76, 81, 191, 0.3)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <AdminPanelSettingsIcon sx={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Administrator
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    You have administrative access to the platform
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Batch Information Banner - Only for non-admin users */}
          {!groupInfo.isAdmin && (groupInfo.year || groupInfo.class || groupInfo.board) && (
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                mb: 4, 
                borderRadius: 4,
                background: 'linear-gradient(135deg, rgba(76, 81, 191, 0.05) 0%, rgba(102, 126, 234, 0.05) 100%)',
                border: '1px solid rgba(76, 81, 191, 0.1)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <CalendarTodayIcon sx={{ color: '#4c51bf', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#4c51bf' }}>
                  Academic Information
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {groupInfo.year && (
                  <Chip 
                    label={`Batch ${groupInfo.year}`} 
                    sx={{ 
                      backgroundColor: 'rgba(76, 81, 191, 0.1)', 
                      color: '#4c51bf',
                      fontWeight: 600 
                    }} 
                  />
                )}
                {groupInfo.class && (
                  <Chip 
                    label={`Class ${groupInfo.class}`} 
                    sx={{ 
                      backgroundColor: 'rgba(76, 81, 191, 0.1)', 
                      color: '#4c51bf',
                      fontWeight: 600 
                    }} 
                  />
                )}
                {groupInfo.board && (
                  <Chip 
                    label={groupInfo.board} 
                    sx={{ 
                      backgroundColor: 'rgba(76, 81, 191, 0.1)', 
                      color: '#4c51bf',
                      fontWeight: 600 
                    }} 
                  />
                )}
              </Box>
            </Paper>
          )}

          {/* Profile Information */}
          <Paper elevation={3} sx={{ 
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #4c51bf 0%, #667eea 100%)',
            }
          }}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #4c51bf 0%, #667eea 100%)', 
              py: 3, 
              px: 4,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -50,
                right: -50,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
              },
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <AccountCircleIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                    {getFullName()}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
                    {groupInfo.isAdmin ? 'Platform Administrator' : 'Student'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #4c51bf 0%, #667eea 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                        }}
                      >
                        <EmailIcon sx={{ fontSize: 20, color: 'white' }} />
                      </Box>
                      <ListItemText 
                        primary={
                          <Typography sx={{ fontWeight: 600, color: 'rgba(0, 0, 0, 0.87)' }}>
                            Email Address
                          </Typography>
                        }
                        secondary={
                          <Typography sx={{ color: 'rgba(0, 0, 0, 0.6)', fontWeight: 500 }}>
                            {getEmail()}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider component="li" sx={{ my: 1 }} />
                    
                    {groupInfo.isAdmin && (
                      <>
                        <ListItem>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              background: 'linear-gradient(135deg, #4c51bf 0%, #667eea 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2,
                            }}
                          >
                            <AdminPanelSettingsIcon sx={{ fontSize: 20, color: 'white' }} />
                          </Box>
                          <ListItemText 
                            primary={
                              <Typography sx={{ fontWeight: 600, color: 'rgba(0, 0, 0, 0.87)' }}>
                                Role
                              </Typography>
                            }
                            secondary={
                              <Typography sx={{ color: 'rgba(0, 0, 0, 0.6)', fontWeight: 500 }}>
                                Administrator
                              </Typography>
                            }
                          />
                        </ListItem>
                        <Divider component="li" sx={{ my: 1 }} />
                      </>
                    )}
                    
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <List>
                    {!groupInfo.isAdmin && (
                      <>
                        {groupInfo.year && (
                          <>
                            <ListItem>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 2,
                                  background: 'linear-gradient(135deg, #4c51bf 0%, #667eea 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 2,
                                }}
                              >
                                <CalendarTodayIcon sx={{ fontSize: 20, color: 'white' }} />
                              </Box>
                              <ListItemText 
                                primary={
                                  <Typography sx={{ fontWeight: 600, color: 'rgba(0, 0, 0, 0.87)' }}>
                                    Batch Year
                                  </Typography>
                                }
                                secondary={
                                  <Typography sx={{ color: 'rgba(0, 0, 0, 0.6)', fontWeight: 500 }}>
                                    {groupInfo.year}
                                  </Typography>
                                }
                              />
                            </ListItem>
                            <Divider component="li" sx={{ my: 1 }} />
                          </>
                        )}
                        
                        {groupInfo.class && (
                          <>
                            <ListItem>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 2,
                                  background: 'linear-gradient(135deg, #4c51bf 0%, #667eea 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 2,
                                }}
                              >
                                <ClassIcon sx={{ fontSize: 20, color: 'white' }} />
                              </Box>
                              <ListItemText 
                                primary={
                                  <Typography sx={{ fontWeight: 600, color: 'rgba(0, 0, 0, 0.87)' }}>
                                    Class
                                  </Typography>
                                }
                                secondary={
                                  <Typography sx={{ color: 'rgba(0, 0, 0, 0.6)', fontWeight: 500 }}>
                                    {groupInfo.class}
                                  </Typography>
                                }
                              />
                            </ListItem>
                            <Divider component="li" sx={{ my: 1 }} />
                          </>
                        )}
                        
                        {groupInfo.board && (
                          <ListItem>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #4c51bf 0%, #667eea 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                              }}
                            >
                              <BookIcon sx={{ fontSize: 20, color: 'white' }} />
                            </Box>
                            <ListItemText 
                              primary={
                                <Typography sx={{ fontWeight: 600, color: 'rgba(0, 0, 0, 0.87)' }}>
                                  Board
                                </Typography>
                              }
                              secondary={
                                <Typography sx={{ color: 'rgba(0, 0, 0, 0.6)', fontWeight: 500 }}>
                                  {groupInfo.board}
                                </Typography>
                              }
                            />
                          </ListItem>
                        )}
                      </>
                    )}
                    
                    {groupInfo.isAdmin && (
                      <ListItem>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #4c51bf 0%, #667eea 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                          }}
                        >
                          <SchoolIcon sx={{ fontSize: 20, color: 'white' }} />
                        </Box>
                        <ListItemText 
                          primary={
                            <Typography sx={{ fontWeight: 600, color: 'rgba(0, 0, 0, 0.87)' }}>
                              Access Level
                            </Typography>
                          }
                          secondary={
                            <Typography sx={{ color: 'rgba(0, 0, 0, 0.6)', fontWeight: 500 }}>
                              Full Platform Access
                            </Typography>
                          }
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  )
}


Profile.getLayout = (page) => <MainLayout isAuthenticated={true} theme="dashboard">{page}</MainLayout>

export default Profile 