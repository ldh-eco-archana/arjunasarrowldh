import React, { useState, useEffect, useMemo } from 'react'
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
import { getSafeUser } from '@/utils/supabase/server'
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
import Skeleton from '@mui/material/Skeleton'
import Backdrop from '@mui/material/Backdrop'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'

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
  const [isContentLoading, setIsContentLoading] = useState(false)
  const [contentIsReady, setContentIsReady] = useState(false)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [initialContentSelected, setInitialContentSelected] = useState(false)
  const [shouldLoadContent, setShouldLoadContent] = useState(false)

  // Group content by type using useMemo to prevent unnecessary recalculations
  const pdfContents = useMemo(() => 
    chapterData?.contents.filter(c => c.content_type === 'pdf') || [], 
    [chapterData]
  )
  
  const videoContents = useMemo(() => 
    chapterData?.contents.filter(c => c.content_type === 'video') || [], 
    [chapterData]
  )

  useEffect(() => {
    // Select the first content item of the current type if none selected
    if (!initialContentSelected && ((contentType === 'pdf' && pdfContents.length > 0) || 
        (contentType === 'video' && videoContents.length > 0))) {
      
      const defaultContent = contentType === 'pdf' 
        ? pdfContents[0] 
        : videoContents[0];
      
      if (defaultContent) {
        setSelectedContent(defaultContent);
        setInitialContentSelected(true);
        // Delay content loading slightly to improve perceived performance
        setTimeout(() => {
          setShouldLoadContent(true);
          setIsContentLoading(true);
        }, 100);
      }
    }
  }, [contentType, pdfContents, videoContents, initialContentSelected]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue)
    setContentType(newValue === 0 ? 'pdf' : 'video')
    setInitialContentSelected(false)
    setSelectedContent(null)
    setContentIsReady(false)
    setShouldLoadContent(false)
  }

  const handleContentSelect = (content: Content): void => {
    if (selectedContent?.id === content.id) return;
    
    setContentIsReady(false);
    setSelectedContent(content);
    // Immediate loading for user-selected content
    setShouldLoadContent(true);
    setIsContentLoading(true);
  }

  const handleContentError = (error: string): void => {
    console.log('Content error occurred:', error);
    setLoadingError(error);
    setIsContentLoading(false);
  }

  const handleContentReady = (): void => {
    setIsContentLoading(false);
    setContentIsReady(true);
    updateContentProgress();
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

  // Render content list item skeletons
  const renderContentSkeletons = (): JSX.Element[] => {
    return Array(3).fill(0).map((_, index) => (
      <React.Fragment key={`skeleton-${index}`}>
        <ListItem disablePadding>
          <ListItemButton disabled>
            <ListItemIcon>
              <Skeleton variant="circular" width={24} height={24} />
            </ListItemIcon>
            <ListItemText 
              primary={<Skeleton variant="text" width="80%" />} 
              secondary={<Skeleton variant="text" width="40%" />} 
            />
          </ListItemButton>
        </ListItem>
        <Divider component="li" />
      </React.Fragment>
    ));
  };

  // Render content viewer skeleton
  const renderContentViewerSkeleton = (): JSX.Element => {
    return <LoadingSkeleton height={{ xs: 250, sm: 350, md: 500 }} />;
  };

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
      
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2 
        }}
        open={isContentLoading && !contentIsReady}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6">
          {contentType === 'pdf' ? 'Loading document...' : 'Loading video...'}
        </Typography>
      </Backdrop>
      
      <Box sx={{ py: 6, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          {/* Breadcrumbs navigation */}
          <Breadcrumbs 
            aria-label="breadcrumb" 
            sx={{ 
              mb: 3,
              flexWrap: 'wrap',
              '& .MuiBreadcrumbs-ol': {
                flexWrap: 'wrap'
              },
              '& .MuiBreadcrumbs-separator': {
                mx: { xs: 0.5, sm: 1 }
              }
            }}
          >
            <Link href="/dashboard" passHref>
              <Typography
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: 'text.primary', 
                  textDecoration: 'none',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  whiteSpace: 'nowrap'
                }}
              >
                <HomeIcon sx={{ mr: 0.5, fontSize: { xs: '0.875rem', sm: '1rem' } }} />
                Dashboard
              </Typography>
            </Link>
            <Typography
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: 'text.primary',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                maxWidth: { xs: '100px', sm: '150px', md: '200px', lg: 'none' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              <MenuBookIcon sx={{ mr: 0.5, fontSize: { xs: '0.875rem', sm: '1rem' } }} />
              {bookData.title}
            </Typography>
            <Typography
              sx={{ 
                display: 'flex', 
                alignItems: 'center',

                color: 'text.secondary',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                maxWidth: { xs: '100px', sm: '150px', md: '200px', lg: 'none' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              <AutoStoriesIcon sx={{ mr: 0.5, fontSize: { xs: '0.875rem', sm: '1rem' } }} />
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
                <Grid item xs={12} md={4} sx={{ order: { xs: 1, md: 1 } }}>
                  <Card sx={{ 
                    height: '100%',
                    mb: { xs: 2, md: 0 } // Add margin bottom on mobile for better separation
                  }}>
                    <CardContent sx={{ pb: { xs: 2, md: 3 } }}>
                      <Typography 
                        variant="h6" 
                        component="h2" 
                        sx={{ 
                          mb: 2,
                          position: { xs: 'sticky', md: 'static' },
                          top: { xs: 0, md: 'auto' },
                          backgroundColor: { xs: 'background.paper', md: 'transparent' },
                          zIndex: { xs: 1, md: 'auto' },
                          py: { xs: 1, md: 0 },
                          mx: { xs: -2, md: 0 },
                          px: { xs: 2, md: 0 }
                        }}
                      >
                        PDF Documents
                        <Typography 
                          variant="caption" 
                          component="div" 
                          sx={{ 
                            display: { xs: 'block', md: 'none' },
                            color: 'text.secondary',
                            fontWeight: 'normal',
                            mt: 0.5
                          }}
                        >
                          Select a document to view below
                        </Typography>
                      </Typography>
                      {pdfContents.length === 0 ? (
                        <Alert severity="info">No PDF documents available</Alert>
                      ) : (
                        <List sx={{ 
                          maxHeight: { xs: '250px', sm: '300px', md: 'none' }, 
                          overflowY: 'auto',
                          '& .MuiListItemButton-root': {
                            borderRadius: 1,
                            mb: 0.5,
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            },
                            '&.Mui-selected': {
                              backgroundColor: 'primary.light',
                              '&:hover': {
                                backgroundColor: 'primary.light'
                              }
                            }
                          }
                        }}>
                          {initialContentSelected ? pdfContents.map((content) => (
                            <React.Fragment key={content.id}>
                              <ListItem disablePadding>
                                <ListItemButton 
                                  selected={selectedContent?.id === content.id}
                                  onClick={() => handleContentSelect(content)}
                                  sx={{ py: { xs: 1.5, md: 1 } }} // More padding on mobile
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
                                        textOverflow: 'ellipsis',
                                        fontWeight: selectedContent?.id === content.id ? 'medium' : 'normal'
                                      }
                                    }}
                                  />
                                </ListItemButton>
                              </ListItem>
                              <Divider component="li" />
                            </React.Fragment>
                          )) : renderContentSkeletons()}
                        </List>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* PDF viewer */}
                <Grid item xs={12} md={8} sx={{ order: { xs: 2, md: 2 } }}>
                  {loadingError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {loadingError}
                    </Alert>
                  )}
                  
                  {!initialContentSelected ? (
                    renderContentViewerSkeleton()
                  ) : selectedContent && selectedContent.content_type === 'pdf' && shouldLoadContent ? (
                    <Box 
                      sx={{ 
                        opacity: contentIsReady ? 1 : 0,
                        transition: 'opacity 0.3s ease-in-out',
                        minHeight: '500px'
                      }}
                    >
                      <ContentPlayer 
                        content={selectedContent} 
                        onError={handleContentError}
                        onProgress={updateContentProgress}
                        onReady={handleContentReady}
                      />
                    </Box>
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
                <Grid item xs={12} md={4} sx={{ order: { xs: 1, md: 1 } }}>
                  <Card sx={{ 
                    height: '100%',
                    mb: { xs: 2, md: 0 } // Add margin bottom on mobile for better separation
                  }}>
                    <CardContent sx={{ pb: { xs: 2, md: 3 } }}>
                      <Typography 
                        variant="h6" 
                        component="h2" 
                        sx={{ 
                          mb: 2,
                          position: { xs: 'sticky', md: 'static' },
                          top: { xs: 0, md: 'auto' },
                          backgroundColor: { xs: 'background.paper', md: 'transparent' },
                          zIndex: { xs: 1, md: 'auto' },
                          py: { xs: 1, md: 0 },
                          mx: { xs: -2, md: 0 },
                          px: { xs: 2, md: 0 }
                        }}
                      >
                        Video Lectures
                        <Typography 
                          variant="caption" 
                          component="div" 
                          sx={{ 
                            display: { xs: 'block', md: 'none' },
                            color: 'text.secondary',
                            fontWeight: 'normal',
                            mt: 0.5
                          }}
                        >
                          Select a video to watch below
                        </Typography>
                      </Typography>
                      {videoContents.length === 0 ? (
                        <Alert severity="info">No videos available</Alert>
                      ) : (
                        <List sx={{ 
                          maxHeight: { xs: '250px', sm: '300px', md: 'none' }, 
                          overflowY: 'auto',
                          '& .MuiListItemButton-root': {
                            borderRadius: 1,
                            mb: 0.5,
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            },
                            '&.Mui-selected': {
                              backgroundColor: 'primary.light',
                              '&:hover': {
                                backgroundColor: 'primary.light'
                              }
                            }
                          }
                        }}>
                          {initialContentSelected ? videoContents.map((content) => (
                            <React.Fragment key={content.id}>
                              <ListItem disablePadding>
                                <ListItemButton 
                                  selected={selectedContent?.id === content.id}
                                  onClick={() => handleContentSelect(content)}
                                  sx={{ py: { xs: 1.5, md: 1 } }} // More padding on mobile
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
                                        textOverflow: 'ellipsis',
                                        fontWeight: selectedContent?.id === content.id ? 'medium' : 'normal'
                                      }
                                    }}
                                  />
                                </ListItemButton>
                              </ListItem>
                              <Divider component="li" />
                            </React.Fragment>
                          )) : renderContentSkeletons()}
                        </List>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Video player */}
                <Grid item xs={12} md={8} sx={{ order: { xs: 2, md: 2 } }}>
                  {loadingError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {loadingError}
                    </Alert>
                  )}
                  
                  {!initialContentSelected ? (
                    renderContentViewerSkeleton()
                  ) : selectedContent && selectedContent.content_type === 'video' && shouldLoadContent ? (
                    <Box 
                      sx={{ 
                        opacity: contentIsReady ? 1 : 0,
                        transition: 'opacity 0.3s ease-in-out',
                        minHeight: '500px'
                      }}
                    >
                      <ContentPlayer 
                        content={selectedContent} 
                        onError={handleContentError}
                        onProgress={updateContentProgress}
                        onReady={handleContentReady}
                      />
                    </Box>
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
  const { params } = context;
  const chapterId = params?.id as string;
  
  if (!chapterId) {
    return {
      notFound: true
    };
  }

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

    // Import supabase server client here only when we need to fetch additional data
    const { createClient } = await import('@/utils/supabase/server');
    const supabase = createClient(context);

    // Run parallel queries for better performance
    const [
      { data: profile, error: profileError },
      { data: chapterData, error: chapterError }
    ] = await Promise.all([
      // Fetch user profile
      supabase
        .from('users')
        .select('*')
        .eq('id', safeUser.id)
        .single(),
      
      // Fetch chapter with minimal content info for faster loading
      supabase
        .from('chapters')
        .select(`
          *,
          contents:content(id, title, content_type, order_number, page_count, duration, file_url)
        `)
        .eq('id', chapterId)
        .single()
    ]);

    if (profileError) {
      return {
        props: {
          user: null,
          error: 'Failed to load user profile',
        },
      };
    }

    if (chapterError) {
      return {
        props: {
          user: profile,
          error: 'Failed to load chapter data',
        },
      };
    }

    // Run remaining queries in parallel
    const [
      { data: bookData, error: bookError },
      { data: courseData }
    ] = await Promise.all([
      // Fetch book data
      supabase
        .from('books')
        .select('*')
        .eq('id', chapterData.book_id)
        .single(),
      
      // Get course info for access check  
      supabase
        .from('books')
        .select('course_id')
        .eq('id', chapterData.book_id)
        .single()
    ]);

    if (bookError) {
      return {
        props: {
          user: profile,
          error: 'Failed to load book data',
        },
      };
    }

    // Check user access if course data is available
    if (courseData?.course_id) {
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