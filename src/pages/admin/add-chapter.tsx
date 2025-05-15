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

// Define shared types
interface ChapterData {
  book_id: string
  title: string
  description: string
  order_number: number
}

interface Book {
  id: string
  title: string
  description: string
  course_id: string
  courses: {
    id: string
    name: string
    board: string
    class: string
  }
}

const AdminAddChapter: NextPageWithLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isDevelopment, setIsDevelopment] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [books, setBooks] = useState<Book[]>([])
  const [fetchingBooks, setFetchingBooks] = useState(false)
  
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
  
  const [formData, setFormData] = useState<ChapterData>({
    book_id: '',
    title: '',
    description: '',
    order_number: 1
  })

  const [errors, setErrors] = useState({
    book_id: '',
    title: '',
    description: '',
    order_number: ''
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
        fetchBooks() // Fetch books when authenticated
      } else {
        setPasswordError('Invalid password')
      }
    } catch (err) {
      setPasswordError('Error verifying password')
      console.error('Password verification error:', err)
    }
  }
  
  const fetchBooks = async (): Promise<void> => {
    setFetchingBooks(true)
    try {
      // Use the admin API to fetch books
      const response = await fetch('/api/admin/get-books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminPassword }),
      })
      
      const result = await response.json()
      
      if (response.ok && result.data) {
        setBooks(result.data.books)
      } else {
        setError('Error fetching books: ' + (result.error || 'Unknown error'))
      }
    } catch (err) {
      setError('Error connecting to the server')
      console.error('Error fetching books:', err)
    } finally {
      setFetchingBooks(false)
    }
  }
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent): void => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order_number' ? Number(value) : value
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
    
    if (!formData.book_id) {
      newErrors.book_id = 'Book selection is required'
      isValid = false
    }
    
    if (!formData.title) {
      newErrors.title = 'Chapter title is required'
      isValid = false
    }
    
    if (!formData.description) {
      newErrors.description = 'Chapter description is required'
      isValid = false
    }
    
    if (formData.order_number < 1) {
      newErrors.order_number = 'Order number must be at least 1'
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
      const response = await fetch('/api/admin/add-chapter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminPassword,
          chapterData: formData
        }),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setSuccess(true)
        // Reset form data but keep the same book selected
        const currentBookId = formData.book_id
        setFormData({
          book_id: currentBookId,
          title: '',
          description: '',
          order_number: formData.order_number + 1 // Increment order number for convenience
        })
      } else {
        setError(result.error || 'Failed to add chapter')
      }
    } catch (err) {
      setError('Error connecting to the server')
      console.error('Error adding chapter:', err)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <>
      <Head>
        <title>Admin - Add Chapter | Coursespace</title>
      </Head>
      
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
                <AdminPanelSettingsIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: '2rem' }} />
                Admin - Add Chapter
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
                      Chapter added successfully!
                    </Alert>
                  )}
                  
                  <Card>
                    <CardContent>
                      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
                        Add New Chapter
                      </Typography>
                      
                      <form onSubmit={handleSubmit}>
                        <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.book_id}>
                          <InputLabel id="book-select-label">Book</InputLabel>
                          <Select
                            labelId="book-select-label"
                            id="book-select"
                            name="book_id"
                            value={formData.book_id}
                            label="Book"
                            onChange={handleChange}
                            disabled={fetchingBooks}
                          >
                            {fetchingBooks ? (
                              <MenuItem value="">
                                <CircularProgress size={20} sx={{ mr: 1 }} /> Loading books...
                              </MenuItem>
                            ) : (
                              books.map(book => (
                                <MenuItem key={book.id} value={book.id}>
                                  {book.title} ({book.courses.name} - {book.courses.board} Class {book.courses.class})
                                </MenuItem>
                              ))
                            )}
                          </Select>
                          {errors.book_id && (
                            <Typography variant="caption" color="error">
                              {errors.book_id}
                            </Typography>
                          )}
                        </FormControl>
                        
                        <TextField
                          label="Chapter Title"
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
                          label="Order Number"
                          name="order_number"
                          type="number"
                          fullWidth
                          variant="outlined"
                          value={formData.order_number}
                          onChange={handleChange}
                          error={!!errors.order_number}
                          helperText={errors.order_number || "Determines the sequence of chapters in the book"}
                          inputProps={{ min: 1 }}
                          sx={{ mb: 3 }}
                        />
                        
                        <StyledButton
                          type="submit"
                          variant="contained"
                          disabled={loading}
                        >
                          {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Chapter'}
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

AdminAddChapter.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default AdminAddChapter 