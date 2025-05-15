import React, { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import Head from 'next/head'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Paper from '@mui/material/Paper'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from 'next/link'
import HomeIcon from '@mui/icons-material/Home'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import { createClient as createClientBrowser } from '@/utils/supabase/client'
import { createServerClient } from '@supabase/ssr'
import { Chapter, Book, Content, User } from '@/types/database.types'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo'
import Divider from '@mui/material/Divider'
import ContentPlayer from '@/components/content/ContentPlayer'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

interface ChapterPageProps {
  user: User | null
  error?: string
  chapterData?: ChapterWithContent
  bookData?: Book
}

interface ChapterWithContent extends Chapter {
  contents: Content[]
}

function TabPanel(props: TabPanelProps): JSX.Element {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chapter-tabpanel-${index}`}
      aria-labelledby={`chapter-tab-${index}`}
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
    id: `chapter-tab-${index}`,
    'aria-controls': `chapter-tabpanel-${index}`,
  }
}

const ChapterPage: NextPageWithLayout<ChapterPageProps> = ({ user, error, chapterData, bookData }) => {
  const [tabValue, setTabValue] = useState(0)
  const [contentType, setContentType] = useState<'pdf' | 'video'>('pdf')
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingError, setLoadingError] = useState<string | null>(null)

  // Group content by type for easy filtering
  const pdfContents = chapterData?.contents.filter(c => c.content_type === 'pdf') || []
  const videoContents = chapterData?.contents.filter(c => c.content_type === 'video') || []

  useEffect(() => {
    // Select the first content item of the current type if none selected
    if (contentType === 'pdf' && pdfContents.length > 0 && !selectedContent) {
      setSelectedContent(pdfContents[0])
    } else if (contentType === 'video' && videoContents.length > 0 && !selectedContent) {
      setSelectedContent(videoContents[0])
    }
  }, [contentType, pdfContents, videoContents, selectedContent])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue)
    setContentType(newValue === 0 ? 'pdf' : 'video')
    setSelectedContent(null) // Reset selection when changing tabs
  }

  const handleContentSelect = (content: Content): void => {
    setSelectedContent(content)
  }

  const handleContentError = (error: string): void => {
    console.log('Content error occurred:', error);
    setLoadingError(error)
  }

  const updateContentProgress = async (): Promise<void> => {
    if (!selectedContent || !user) return
    
    try {
      const supabase = createClientBrowser()
      
      // Progress tracking is handled by the server endpoints
      console.log('Content accessed:', selectedContent.id)
    } catch (err) {
      console.error('Error updating progress:', err)
    }
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

  if (!chapterData || !bookData) {
    return (
      <Box sx={{ py: 12, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" align="center">
            Chapter not found
          </Typography>
        </Container>
      </Box>
    )
  }

  return (
    <>
      <Head>
        <title>{chapterData.title} | Economics E-Learning Portal</title>
        <meta 
          name="description" 
          content={`Study materials for ${chapterData.title} - ${bookData.title}`}
        />
      </Head>
      <Box sx={{ py: 6, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          {/* Breadcrumbs navigation */}
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
            <Link href="/dashboard" passHref>
              <Typography
                sx={{ display: 'flex', alignItems: 'center', color: 'text.primary', textDecoration: 'none' }}
              >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Dashboard
              </Typography>
            </Link>
            <Typography
              sx={{ display: 'flex', alignItems: 'center', color: 'text.primary' }}
            >
              <MenuBookIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {bookData.title}
            </Typography>
            <Typography
              sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}
            >
              <AutoStoriesIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {chapterData.title}
            </Typography>
          </Breadcrumbs>
          
          <Typography variant="h3" component="h1" sx={{ 
            mb: 3, 
            fontWeight: 'bold',
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' }
          }}>
            {chapterData.title}
          </Typography>
          
          <Typography variant="subtitle1" sx={{ mb: 5 }}>
            {chapterData.description}
          </Typography>
          
          <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="content type tabs"
                variant="fullWidth"
                sx={{
                  '.MuiTab-root': {
                    minHeight: { xs: '48px', sm: '64px' },
                    py: { xs: 1, sm: 2 },
                  }
                }}
              >
                <Tab 
                  label={`PDFs (${pdfContents.length})`} 
                  icon={<PictureAsPdfIcon />} 
                  {...a11yProps(0)} 
                  disabled={pdfContents.length === 0}
                  sx={{ 
                    flexDirection: { xs: 'row', sm: 'column' },
                    '& .MuiTab-iconWrapper': {
                      mr: { xs: 1, sm: 0 },
                      mb: { xs: 0, sm: 1 },
                    }
                  }}
                />
                <Tab 
                  label={`Videos (${videoContents.length})`} 
                  icon={<OndemandVideoIcon />} 
                  {...a11yProps(1)} 
                  disabled={videoContents.length === 0}
                  sx={{ 
                    flexDirection: { xs: 'row', sm: 'column' },
                    '& .MuiTab-iconWrapper': {
                      mr: { xs: 1, sm: 0 },
                      mb: { xs: 0, sm: 1 },
                    }
                  }}
                />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                {/* PDF content list */}
                <Grid item xs={12} md={4} sx={{ order: { xs: 2, md: 1 } }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                        PDF Documents
                      </Typography>
                      {pdfContents.length === 0 ? (
                        <Alert severity="info">No PDF documents available</Alert>
                      ) : (
                        <List sx={{ maxHeight: { xs: '200px', sm: '300px', md: 'none' }, overflowY: 'auto' }}>
                          {pdfContents.map((content) => (
                            <React.Fragment key={content.id}>
                              <ListItem disablePadding>
                                <ListItemButton 
                                  selected={selectedContent?.id === content.id}
                                  onClick={() => handleContentSelect(content)}
                                >
                                  <ListItemIcon>
                                    <PictureAsPdfIcon color="primary" />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={content.title} 
                                    secondary={`${content.page_count} pages`}
                                    primaryTypographyProps={{
                                      noWrap: true,
                                      sx: { 
                                        maxWidth: { xs: '200px', sm: 'none' },
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }
                                    }}
                                  />
                                </ListItemButton>
                              </ListItem>
                              <Divider component="li" />
                            </React.Fragment>
                          ))}
                        </List>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* PDF viewer */}
                <Grid item xs={12} md={8} sx={{ order: { xs: 1, md: 2 } }}>
                  {loadingError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {loadingError}
                    </Alert>
                  )}
                  
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : selectedContent && selectedContent.content_type === 'pdf' ? (
                    <ContentPlayer 
                      content={selectedContent} 
                      onError={handleContentError}
                      onProgress={updateContentProgress}
                    />
                  ) : (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                      <Typography>Select a PDF document to view</Typography>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                {/* Video content list */}
                <Grid item xs={12} md={4} sx={{ order: { xs: 2, md: 1 } }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                        Video Lectures
                      </Typography>
                      {videoContents.length === 0 ? (
                        <Alert severity="info">No videos available</Alert>
                      ) : (
                        <List sx={{ maxHeight: { xs: '200px', sm: '300px', md: 'none' }, overflowY: 'auto' }}>
                          {videoContents.map((content) => (
                            <React.Fragment key={content.id}>
                              <ListItem disablePadding>
                                <ListItemButton 
                                  selected={selectedContent?.id === content.id}
                                  onClick={() => handleContentSelect(content)}
                                >
                                  <ListItemIcon>
                                    <OndemandVideoIcon color="primary" />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={content.title} 
                                    secondary={content.duration 
                                      ? `${Math.floor(content.duration / 60)}:${String(content.duration % 60).padStart(2, '0')}` 
                                      : 'Video lecture'}
                                    primaryTypographyProps={{
                                      noWrap: true,
                                      sx: { 
                                        maxWidth: { xs: '200px', sm: 'none' },
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }
                                    }}
                                  />
                                </ListItemButton>
                              </ListItem>
                              <Divider component="li" />
                            </React.Fragment>
                          ))}
                        </List>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Video player */}
                <Grid item xs={12} md={8} sx={{ order: { xs: 1, md: 2 } }}>
                  {loadingError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {loadingError}
                    </Alert>
                  )}
                  
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : selectedContent && selectedContent.content_type === 'video' ? (
                    <ContentPlayer 
                      content={selectedContent} 
                      onError={handleContentError}
                      onProgress={updateContentProgress}
                    />
                  ) : (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                      <Typography>Select a video to view</Typography>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Container>
      </Box>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<ChapterPageProps> = async (context) => {
  const { req, res, params } = context;
  const chapterId = params?.id as string;
  
  if (!chapterId) {
    return {
      notFound: true
    };
  }
  
  // Create server-side Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name: string) {
          return req.cookies[name];
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          res.setHeader('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`);
        },
        remove(name: string, options: Record<string, unknown>) {
          res.setHeader('Set-Cookie', `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
        },
      },
    }
  );

  try {
    // Check for authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    // Fetch user profile
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

    // Fetch chapter with contents
    const { data: chapterData, error: chapterError } = await supabase
      .from('chapters')
      .select(`
        *,
        contents:content(*)
      `)
      .eq('id', chapterId)
      .single();

    if (chapterError) {
      return {
        props: {
          user: profile,
          error: 'Failed to load chapter data',
        },
      };
    }

    // Fetch book data
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', chapterData.book_id)
      .single();

    if (bookError) {
      return {
        props: {
          user: profile,
          error: 'Failed to load book data',
        },
      };
    }

    // Check if user has access to this content
    const { data: courseData } = await supabase
      .from('books')
      .select('course_id')
      .eq('id', chapterData.book_id)
      .single();

    if (courseData) {
      const { data: userCourseData, error: userCourseError } = await supabase
        .from('user_courses')
        .select('id')
        .eq('user_id', profile.id)
        .eq('course_id', courseData.course_id)
        .single();

      if (userCourseError || !userCourseData) {
        return {
          props: {
            user: profile,
            error: 'You do not have access to this chapter',
          },
        };
      }
    }

    // Order contents by order_number
    if (chapterData.contents) {
      chapterData.contents.sort((a: Content, b: Content) => a.order_number - b.order_number);
    }

    return {
      props: {
        user: profile,
        chapterData,
        bookData,
      },
    };
  } catch (error) {
    console.error('Server-side error:', error);
    return {
      props: {
        user: null,
        error: 'An unexpected error occurred',
      },
    };
  }
};

ChapterPage.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default ChapterPage 