import React, { useState, useEffect, useCallback } from 'react'
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
import { User, Course, Book, Chapter } from '@/types/database.types'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Paper from '@mui/material/Paper'
import { createClient as createClientBrowser } from '@/utils/supabase/client'
import { getSafeUser } from '@/utils/supabase/server'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Grid from '@mui/material/Grid'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import Skeleton from '@mui/material/Skeleton'
import Fade from '@mui/material/Fade'
import { SupabaseClient } from '@supabase/supabase-js'
import { useSignOut } from '@/hooks/useSignOut'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

interface DashboardProps {
  user: User | null
  error?: string
}

interface CourseWithBooks extends Course {
  books: BookWithChapters[];
  progress: number;
}

interface BookWithChapters extends Book {
  chapters: Chapter[];
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
  const { signOut } = useSignOut()
  const [tabValue, setTabValue] = useState(0)
  const [sessionStatus, setSessionStatus] = useState<string | null>(null)
  const [coursesWithContent, setCoursesWithContent] = useState<CourseWithBooks[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingBooks, setLoadingBooks] = useState(false)
  const [loadingChapters, setLoadingChapters] = useState(false)
  const [expanded, setExpanded] = useState<string | false>(false)
  const [loadingError, setLoadingError] = useState<string | null>(null)

  // Split the fetching into multiple steps for progressive loading
  const fetchCourseStructure = useCallback(async (userId: string): Promise<void> => {
    setLoadingCourses(true)
    setLoadingError(null)
    
    try {
      const supabase = createClientBrowser()
      
      // Step 1: Fetch user enrolled courses first
      const { data: userCoursesData, error: userCoursesError } = await supabase
        .from('user_courses')
        .select(`
          id,
          progress,
          courses:course_id (
            id,
            name,
            description,
            board,
            class,
            cover_image_url,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId)
      
      if (userCoursesError) {
        throw new Error(`Failed to fetch courses: ${userCoursesError.message}`)
      }
      
      if (!userCoursesData || userCoursesData.length === 0) {
        setCoursesWithContent([])
        setLoadingCourses(false)
        return
      }
      
      // Extract course IDs and validate nested structure
      const courseIds = userCoursesData.map(uc => {
        // Check if courses is an array with at least one element or a single object
        const course = Array.isArray(uc.courses) ? uc.courses[0] : uc.courses;
        if (!course) {
          console.error("Course data structure is invalid", uc);
          return null;
        }
        return course.id;
      }).filter(Boolean) as string[];
      
      // Create a map for progress
      const progressMap = new Map();
      userCoursesData.forEach(uc => {
        const course = Array.isArray(uc.courses) ? uc.courses[0] : uc.courses;
        if (course) {
          progressMap.set(course.id, uc.progress);
        }
      });
      
      // Prepare courses with their data
      const courses: CourseWithBooks[] = userCoursesData.map(uc => {
        const course = Array.isArray(uc.courses) ? uc.courses[0] : uc.courses;
        if (!course) return null;
        
        return {
          ...course,
          progress: progressMap.get(course.id) || 0,
          books: [] as BookWithChapters[]
        };
      }).filter(Boolean) as CourseWithBooks[];
      
      // Show courses immediately
      setCoursesWithContent(courses);
      setLoadingCourses(false);
      
      // Step 2: Fetch books in the background
      setLoadingBooks(true);
      fetchBooks(supabase, courseIds, courses);
      
    } catch (error) {
      console.error('Error fetching course content:', error)
      setLoadingError((error as Error).message)
      setLoadingCourses(false)
    }
  }, []);

  const checkSession = async (): Promise<void> => {
    // Verify session on client-side as well
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

  useEffect(() => {
    checkSession()
  }, [router])

  useEffect(() => {
    if (user?.id && tabValue === 0) {
      fetchCourseStructure(user.id)
    }
  }, [user, tabValue, fetchCourseStructure])

  // Separate function to fetch books
  const fetchBooks = async (
    supabase: SupabaseClient, 
    courseIds: string[], 
    courses: CourseWithBooks[]
  ): Promise<void> => {
    try {
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .in('course_id', courseIds)
      
      if (booksError) {
        throw new Error(`Failed to fetch books: ${booksError.message}`)
      }
      
      // Create a map of course_id to books
      const courseToBooks = new Map<string, BookWithChapters[]>()
      booksData.forEach((book: Book) => {
        if (!courseToBooks.has(book.course_id)) {
          courseToBooks.set(book.course_id, [])
        }
        courseToBooks.get(book.course_id)?.push({...book, chapters: []})
      })
      
      // Update the courses with books
      const updatedCourses = [...courses];
      updatedCourses.forEach(course => {
        course.books = courseToBooks.get(course.id) || []
      })
      
      setCoursesWithContent(updatedCourses)
      setLoadingBooks(false)
      
      // Extract book IDs
      const bookIds = booksData.map((book: Book) => book.id)
      
      if (bookIds.length > 0) {
        // Step 3: Fetch chapters in the background
        setLoadingChapters(true)
        fetchChapters(supabase, bookIds, updatedCourses)
      }
    } catch (error) {
      console.error('Error fetching books:', error)
      setLoadingBooks(false)
    }
  }
  
  // Separate function to fetch chapters
  const fetchChapters = async (
    supabase: SupabaseClient, 
    bookIds: string[], 
    courses: CourseWithBooks[]
  ): Promise<void> => {
    try {
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .in('book_id', bookIds)
        .order('order_number', { ascending: true })
      
      if (chaptersError) {
        throw new Error(`Failed to fetch chapters: ${chaptersError.message}`)
      }
      
      // Create a map of book_id to chapters
      const bookToChapters = new Map<string, Chapter[]>()
      chaptersData.forEach((chapter: Chapter) => {
        if (!bookToChapters.has(chapter.book_id)) {
          bookToChapters.set(chapter.book_id, [])
        }
        bookToChapters.get(chapter.book_id)?.push(chapter)
      })
      
      // Update books with chapters
      const finalCourses = [...courses]
      finalCourses.forEach(course => {
        course.books.forEach(book => {
          book.chapters = bookToChapters.get(book.id) || []
        })
      })
      
      setCoursesWithContent(finalCourses)
    } catch (error) {
      console.error('Error fetching chapters:', error)
    } finally {
      setLoadingChapters(false)
    }
  }

  const handleSignOut = async (): Promise<void> => {
    await signOut()
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue)
  }

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

  const navigateToChapter = (chapter: Chapter): void => {
    router.push(`/chapter/${chapter.id}`)
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

  const renderBookSkeleton = (): JSX.Element => {
    return (
      <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, height: '100%', mb: 2 }}>
        <Skeleton variant="rectangular" sx={{ width: { xs: '100%', sm: 140 }, height: { xs: 200, sm: 'auto' } }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 2 }}>
          <Skeleton variant="text" sx={{ fontSize: '2rem', width: '80%', mb: 1 }} />
          <Skeleton variant="text" sx={{ fontSize: '1rem', width: '90%' }} />
          <Skeleton variant="text" sx={{ fontSize: '1rem', width: '70%' }} />
          <Box sx={{ mt: 2 }}>
            <Skeleton variant="rounded" height={40} />
          </Box>
        </Box>
      </Card>
    );
  };

  const renderBookCard = (book: BookWithChapters): JSX.Element => {
    return (
      <Fade in={true} timeout={500}>
        <Card 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            height: '100%',
            mb: 2
          }}
        >
          {book.cover_image_url ? (
            <CardMedia
              component="img"
              sx={{ 
                width: { xs: '100%', sm: 140 },
                height: { xs: 200, sm: 'auto' },
                objectFit: 'cover'
              }}
              image={book.cover_image_url}
              alt={book.title}
            />
          ) : (
            <Box 
              sx={{ 
                width: { xs: '100%', sm: 140 },
                height: { xs: 200, sm: 'auto' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.light',
                color: 'primary.contrastText'
              }}
            >
              <MenuBookIcon sx={{ fontSize: 60 }} />
            </Box>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <CardContent sx={{ flex: '1 0 auto' }}>
              <Typography component="div" variant="h5">
                {book.title}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" component="div">
                {book.description}
              </Typography>
            </CardContent>
            <Box sx={{ p: 2 }}>
              <Accordion 
                expanded={expanded === `book-${book.id}`} 
                onChange={handleAccordionChange(`book-${book.id}`)}
                sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`book-${book.id}-content`}
                  id={`book-${book.id}-header`}
                  sx={{ 
                    backgroundColor: 'background.default',
                    borderRadius: 1
                  }}
                >
                  <Typography>
                    {loadingChapters ? 
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={16} sx={{ mr: 1 }} /> Loading chapters...
                      </Box> 
                      : 
                      `${book.chapters.length} Chapter${book.chapters.length !== 1 ? 's' : ''}`
                    }
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {loadingChapters ? (
                    <List disablePadding>
                      {[1, 2, 3].map((i) => (
                        <ListItem 
                          key={i} 
                          disablePadding
                          sx={{ 
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            py: 1
                          }}
                        >
                          <Skeleton variant="rectangular" height={50} width="100%" />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <List disablePadding>
                      {book.chapters.map((chapter) => (
                        <ListItem 
                          key={chapter.id} 
                          disablePadding
                          sx={{ 
                            borderBottom: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <ListItemButton onClick={() => navigateToChapter(chapter)}>
                            <ListItemIcon>
                              <AutoStoriesIcon />
                            </ListItemIcon>
                            <ListItemText 
                              primary={chapter.title} 
                              secondary={`Chapter ${chapter.order_number}`} 
                            />
                            <ChevronRightIcon />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </AccordionDetails>
              </Accordion>
            </Box>
          </Box>
        </Card>
      </Fade>
    )
  }

  const renderCourseContent = (): JSX.Element | JSX.Element[] => {
    if (loadingCourses) {
      return (
        <Box sx={{ mt: 4 }}>
          {[1, 2].map((i) => (
            <Box key={i} sx={{ mb: 4 }}>
              <Box sx={{ mb: 2 }}>
                <Skeleton variant="text" sx={{ fontSize: '2rem', width: '60%' }} />
                <Skeleton variant="text" sx={{ fontSize: '1rem', width: '30%' }} />
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  {renderBookSkeleton()}
                </Grid>
                <Grid item xs={12}>
                  {renderBookSkeleton()}
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>
      )
    }

    if (loadingError) {
      return (
        <Alert severity="error" sx={{ mb: 3 }}>
          {loadingError}
        </Alert>
      )
    }

    if (!coursesWithContent || coursesWithContent.length === 0) {
      return (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
          No courses found. Please contact support if you believe this is an error.
        </Typography>
      )
    }

    return coursesWithContent.map((course) => (
      <Fade in={true} key={course.id} timeout={300}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" component="h2">
              {course.name}
            </Typography>
            <Chip 
              label={`${course.progress}% Complete`} 
              color={course.progress > 0 ? "primary" : "default"}
              variant={course.progress > 0 ? "filled" : "outlined"}
            />
          </Box>
          
          {loadingBooks ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                {renderBookSkeleton()}
              </Grid>
              <Grid item xs={12}>
                {renderBookSkeleton()}
              </Grid>
            </Grid>
          ) : course.books.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No books available for this course yet.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {course.books.map((book) => (
                <Grid item xs={12} key={book.id}>
                  {renderBookCard(book)}
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Fade>
    ))
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
          
          <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
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
              {renderCourseContent()}
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
  try {
    // Fast and secure authentication check using JWT verification
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

    // Fetch user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', safeUser.id)
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

Dashboard.getLayout = (page) => <MainLayout isAuthenticated={true}>{page}</MainLayout>

export default Dashboard 