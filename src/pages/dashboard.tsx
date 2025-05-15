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
import { User, Course, Book, Chapter, UserCourse } from '@/types/database.types'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Paper from '@mui/material/Paper'
import { createClient as createClientBrowser } from '@/utils/supabase/client'
import { createServerClient } from '@supabase/ssr'
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
  const [tabValue, setTabValue] = useState(0)
  const [sessionStatus, setSessionStatus] = useState<string | null>(null)
  const [coursesWithContent, setCoursesWithContent] = useState<CourseWithBooks[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | false>(false)
  const [loadingError, setLoadingError] = useState<string | null>(null)

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

  useEffect(() => {
    if (user?.id && tabValue === 0) {
      fetchCourseContent(user.id)
    }
  }, [user, tabValue])

  const fetchCourseContent = async (userId: string): Promise<void> => {
    setLoading(true)
    setLoadingError(null)
    
    try {
      const supabase = createClientBrowser()
      
      // Fetch user enrolled courses
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
        setLoading(false)
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
      
      // Fetch books for all courses
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .in('course_id', courseIds)
      
      if (booksError) {
        throw new Error(`Failed to fetch books: ${booksError.message}`)
      }
      
      // Create a map of course_id to books
      const courseToBooks = new Map<string, BookWithChapters[]>()
      booksData.forEach(book => {
        if (!courseToBooks.has(book.course_id)) {
          courseToBooks.set(book.course_id, [])
        }
        courseToBooks.get(book.course_id)?.push({...book, chapters: []})
      })
      
      // Populate books in courses
      courses.forEach(course => {
        course.books = courseToBooks.get(course.id) || []
      })
      
      // Extract book IDs
      const bookIds = booksData.map(book => book.id)
      
      if (bookIds.length > 0) {
        // Fetch chapters for all books
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
        chaptersData.forEach(chapter => {
          if (!bookToChapters.has(chapter.book_id)) {
            bookToChapters.set(chapter.book_id, [])
          }
          bookToChapters.get(chapter.book_id)?.push(chapter)
        })
        
        // Populate chapters in books
        courses.forEach(course => {
          course.books.forEach(book => {
            book.chapters = bookToChapters.get(book.id) || []
          })
        })
      }
      
      setCoursesWithContent(courses)
    } catch (error) {
      console.error('Error fetching course content:', error)
      setLoadingError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

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

  const renderBookCard = (book: BookWithChapters): JSX.Element => {
    return (
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
                  {book.chapters.length} Chapter{book.chapters.length !== 1 ? 's' : ''}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
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
              </AccordionDetails>
            </Accordion>
          </Box>
        </Box>
      </Card>
    )
  }

  const renderCourseContent = (): JSX.Element | JSX.Element[] => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
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
      <Box key={course.id} sx={{ mb: 4 }}>
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
        
        {course.books.length === 0 ? (
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