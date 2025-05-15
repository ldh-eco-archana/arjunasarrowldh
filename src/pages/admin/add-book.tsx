import React, { useState, ChangeEvent, useEffect, FormEvent } from 'react'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import Head from 'next/head'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { StyledButton } from '@/components/styled-button'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import LockIcon from '@mui/icons-material/Lock'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'

// Define shared type
interface BookData {
  course_id: string
  title: string
  description: string
  cover_image_url: string
}

interface Course {
  id: string
  name: string
  board: string
  class: string
}

const AdminAddBook: NextPageWithLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isDevelopment, setIsDevelopment] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [fetchingCourses, setFetchingCourses] = useState(false)
  
  // Check if we're in development mode
  useEffect(() => {
    const checkMode = async (): Promise<void> => {
      try {
        const res = await fetch('/api/check-dev-mode');
        const data = await res.json();
        setIsDevelopment(data.isDevelopment);
        
        if (!data.isDevelopment) {
          setError('Admin operations are only available in development mode');
        }
      } catch (err) {
        console.error('Failed to check environment mode:', err);
        setError('Unable to verify environment mode status');
      }
    };
    
    checkMode();
  }, []);
  
  const [formData, setFormData] = useState<BookData>({
    course_id: '',
    title: '',
    description: '',
    cover_image_url: ''
  })

  const [errors, setErrors] = useState({
    course_id: '',
    title: '',
    description: ''
  })

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    try {
      // Verify admin password through API endpoint
      const response = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminPassword }),
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setIsAuthenticated(true)
        setPasswordError('')
        fetchCourses() // Fetch courses when authenticated
      } else {
        setPasswordError('Invalid password')
      }
    } catch (err) {
      setPasswordError('Error verifying password')
      console.error('Password verification error:', err)
    }
  }
  
  const fetchCourses = async (): Promise<void> => {
    setFetchingCourses(true)
    try {
      // Use the admin client to fetch courses
      const response = await fetch('/api/admin/get-courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminPassword }),
      })
      
      const result = await response.json()
      
      if (response.ok && result.data) {
        setCourses(result.data.courses)
      } else {
        setError('Error fetching courses: ' + (result.error || 'Unknown error'))
      }
    } catch (err) {
      setError('Error connecting to the server')
      console.error('Error fetching courses:', err)
    } finally {
      setFetchingCourses(false)
    }
  }
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent): void => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear any existing error for the field
    if (name in errors) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }
  
  const validateForm = (): boolean => {
    let isValid = true
    const newErrors = { ...errors }
    
    if (!formData.course_id) {
      newErrors.course_id = 'Course selection is required'
      isValid = false
    }
    
    if (!formData.title) {
      newErrors.title = 'Book title is required'
      isValid = false
    }
    
    if (!formData.description) {
      newErrors.description = 'Book description is required'
      isValid = false
    }
    
    setErrors(newErrors)
    return isValid
  }
  
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/add-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminPassword,
          bookData: formData
        }),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setSuccess(true)
        setFormData({
          course_id: '',
          title: '',
          description: '',
          cover_image_url: ''
        })
      } else {
        setError(result.error || 'Failed to add book')
      }
    } catch (err) {
      setError('Error connecting to the server')
      console.error('Error adding book:', err)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <>
      <Head>
        <title>Admin - Add Book | Coursespace</title>
      </Head>
      
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
                <AdminPanelSettingsIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: '2rem' }} />
                Admin - Add Book
              </Typography>
              
              {!isAuthenticated ? (
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
                      <LockIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Authentication Required
                    </Typography>
                    
                    {!isDevelopment && (
                      <Alert severity="error" sx={{ mb: 3 }}>
                        Admin operations are only available in development mode.
                      </Alert>
                    )}
                    
                    <form onSubmit={handlePasswordSubmit}>
                      <TextField
                        label="Admin Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={adminPassword}
                        onChange={e => setAdminPassword(e.target.value)}
                        error={!!passwordError}
                        helperText={passwordError}
                        sx={{ mb: 3 }}
                      />
                      
                      <StyledButton
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={!isDevelopment}
                      >
                        Authenticate
                      </StyledButton>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}
                  
                  {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                      Book added successfully!
                    </Alert>
                  )}
                  
                  <Card>
                    <CardContent>
                      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
                        Add New Book
                      </Typography>
                      
                      <form onSubmit={handleSubmit}>
                        <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.course_id}>
                          <InputLabel id="course-select-label">Course</InputLabel>
                          <Select
                            labelId="course-select-label"
                            id="course-select"
                            name="course_id"
                            value={formData.course_id}
                            label="Course"
                            onChange={handleChange}
                            disabled={fetchingCourses}
                          >
                            {fetchingCourses ? (
                              <MenuItem value="">
                                <CircularProgress size={20} sx={{ mr: 1 }} /> Loading courses...
                              </MenuItem>
                            ) : (
                              courses.map(course => (
                                <MenuItem key={course.id} value={course.id}>
                                  {course.name} ({course.board} - Class {course.class})
                                </MenuItem>
                              ))
                            )}
                          </Select>
                          {errors.course_id && (
                            <Typography variant="caption" color="error">
                              {errors.course_id}
                            </Typography>
                          )}
                        </FormControl>
                        
                        <TextField
                          label="Book Title"
                          name="title"
                          fullWidth
                          variant="outlined"
                          value={formData.title}
                          onChange={handleChange}
                          error={!!errors.title}
                          helperText={errors.title}
                          sx={{ mb: 3 }}
                        />
                        
                        <TextField
                          label="Description"
                          name="description"
                          fullWidth
                          multiline
                          rows={4}
                          variant="outlined"
                          value={formData.description}
                          onChange={handleChange}
                          error={!!errors.description}
                          helperText={errors.description}
                          sx={{ mb: 3 }}
                        />
                        
                        <TextField
                          label="Cover Image URL"
                          name="cover_image_url"
                          fullWidth
                          variant="outlined"
                          value={formData.cover_image_url}
                          onChange={handleChange}
                          sx={{ mb: 3 }}
                        />
                        
                        <StyledButton
                          type="submit"
                          variant="contained"
                          fullWidth
                          disabled={loading}
                        >
                          {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Book'}
                        </StyledButton>
                      </form>
                    </CardContent>
                  </Card>
                </>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  )
}

AdminAddBook.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default AdminAddBook 