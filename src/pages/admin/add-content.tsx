import React, { useState, ChangeEvent, useEffect, FormEvent, useRef } from 'react'
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
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import LinearProgress from '@mui/material/LinearProgress'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

// Define shared types
interface ContentData {
  chapter_id: string
  title: string
  description: string
  content_type: 'pdf' | 'video'
  file_url: string
  duration: number | null
  page_count: number | null
  order_number: number
  is_free: boolean
}

interface Book {
  id: string
  title: string
  course_id: string
  courses: {
    id: string
    name: string
    board: string
    class: string
  }
}

interface Chapter {
  id: string
  title: string
  book_id: string
  order_number: number
}

const AdminAddContent: NextPageWithLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isDevelopment, setIsDevelopment] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [books, setBooks] = useState<Book[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [fetchingBooks, setFetchingBooks] = useState(false)
  const [fetchingChapters, setFetchingChapters] = useState(false)
  const [selectedBookId, setSelectedBookId] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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
  
  const [formData, setFormData] = useState<ContentData>({
    chapter_id: '',
    title: '',
    description: '',
    content_type: 'pdf',
    file_url: '',
    duration: null,
    page_count: null,
    order_number: 1,
    is_free: false
  })

  const [errors, setErrors] = useState({
    chapter_id: '',
    title: '',
    description: '',
    file_url: '',
    duration: '',
    page_count: '',
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
      // Use the admin API to fetch books with course info
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
  
  const fetchChaptersByBook = async (bookId: string): Promise<void> => {
    if (!bookId) return
    
    setFetchingChapters(true)
    setFormData(prev => ({ ...prev, chapter_id: '' })) // Reset chapter selection
    
    try {
      // Use the admin API to fetch chapters for the selected book
      const response = await fetch('/api/admin/get-chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          adminPassword,
          bookId
        }),
      })
      
      const result = await response.json()
      
      if (response.ok && result.data) {
        setChapters(result.data.chapters)
      } else {
        setError('Error fetching chapters: ' + (result.error || 'Unknown error'))
      }
    } catch (err) {
      setError('Error connecting to the server')
      console.error('Error fetching chapters:', err)
    } finally {
      setFetchingChapters(false)
    }
  }
  
  const handleBookChange = (e: SelectChangeEvent): void => {
    const bookId = e.target.value
    setSelectedBookId(bookId)
    fetchChaptersByBook(bookId)
    
    // Clear any existing book-related error
    setErrors(prev => ({
      ...prev,
      chapter_id: ''
    }))
  }
  
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ): void => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order_number' 
        ? Number(value) 
        : name === 'duration' || name === 'page_count' 
          ? value === '' ? null : Number(value)
          : value
    }))
    
    // Clear any existing error for the field
    if (name in errors) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }
  
  const handleSwitchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }
  
  const handleContentTypeChange = (e: SelectChangeEvent): void => {
    const contentType = e.target.value as 'pdf' | 'video'
    
    setFormData(prev => ({
      ...prev,
      content_type: contentType,
      // Reset type-specific fields when changing type
      duration: contentType === 'video' ? (prev.duration || 0) : null,
      page_count: contentType === 'pdf' ? (prev.page_count || 0) : null
    }))
  }
  
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const file = files[0]
    setUploadedFile(file)
    
    // Auto-detect content type based on file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    
    if (fileExtension === 'pdf') {
      setFormData(prev => ({
        ...prev,
        content_type: 'pdf',
        duration: null,
        page_count: prev.page_count || 1
      }))
    } else if (['mp4', 'webm', 'mov', 'avi'].includes(fileExtension || '')) {
      setFormData(prev => ({
        ...prev,
        content_type: 'video',
        page_count: null,
        duration: prev.duration || 1
      }))
    }
    
    // Clear file_url error if present
    setErrors(prev => ({
      ...prev,
      file_url: ''
    }))
  }
  
  const uploadFile = async (): Promise<void> => {
    if (!uploadedFile || !formData.chapter_id) return
    
    setUploading(true)
    setUploadProgress(0)
    setError(null)
    
    try {
      // Create FormData object
      const formDataObj = new FormData()
      formDataObj.append('file', uploadedFile)
      formDataObj.append('adminPassword', adminPassword)
      formDataObj.append('contentType', formData.content_type)
      formDataObj.append('chapterId', formData.chapter_id)
      
      // Add basic content metadata for automatic database insertion
      if (formData.title) {
        formDataObj.append('title', formData.title)
        formDataObj.append('description', formData.description || '')
        formDataObj.append('orderNumber', formData.order_number.toString())
        formDataObj.append('isFree', formData.is_free.toString())
      }
      
      // Upload the file with progress tracking
      const xhr = new XMLHttpRequest()
      
      xhr.open('POST', '/api/admin/upload-content', true)
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(percentComplete)
        }
      }
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          
          if (response.data && response.data.fileUrl) {
            setFormData(prev => ({
              ...prev,
              file_url: response.data.fileUrl
            }))
            
            // Auto-set page count for PDFs if response includes it
            if (formData.content_type === 'pdf' && response.data.pageCount) {
              setFormData(prev => ({
                ...prev,
                page_count: response.data.pageCount
              }))
            }
            
            // Auto-set duration for videos if response includes it
            if (formData.content_type === 'video' && response.data.duration) {
              setFormData(prev => ({
                ...prev,
                duration: response.data.duration
              }))
            }
            
            // Show success message with database insertion info if title was provided
            if (formData.title) {
              setSuccess(true);
              setError("Content uploaded and added to database! You can now add more content or navigate away.");
            }
          } else {
            setError('Upload succeeded but no file URL was returned')
          }
        } else if (xhr.status === 409) {
          // Conflict - duplicate order number
          const response = JSON.parse(xhr.responseText)
          
          if (response.data && response.data.fileUrl) {
            // Still set the file URL so they can save with a different order number
            setFormData(prev => ({
              ...prev,
              file_url: response.data.fileUrl
            }))
            
            // Auto-set metadata if available
            if (formData.content_type === 'pdf' && response.data.pageCount) {
              setFormData(prev => ({
                ...prev,
                page_count: response.data.pageCount
              }))
            }
            
            if (formData.content_type === 'video' && response.data.duration) {
              setFormData(prev => ({
                ...prev,
                duration: response.data.duration
              }))
            }
            
            // Show warning
            setError(response.warning || response.error || 'A content item with this order number already exists. Please use a different order number.')
            
            // Increment the order number to help the user
            setFormData(prev => ({
              ...prev,
              order_number: prev.order_number + 1
            }))
          } else {
            setError('Upload completed but there was a conflict with existing content')
          }
        } else {
          let errorMessage = 'Upload failed'
          try {
            const response = JSON.parse(xhr.responseText)
            errorMessage = response.error || errorMessage
          } catch (e) {
            // If we can't parse the error response
          }
          setError(errorMessage)
        }
        setUploading(false)
      }
      
      xhr.onerror = () => {
        setError('Upload failed due to a network error')
        setUploading(false)
      }
      
      xhr.send(formDataObj)
    } catch (err) {
      setError('Error uploading file: ' + (err instanceof Error ? err.message : String(err)))
      setUploading(false)
    }
  }
  
  const validateForm = (): boolean => {
    let isValid = true
    const newErrors = { ...errors }
    
    if (!formData.chapter_id) {
      newErrors.chapter_id = 'Chapter selection is required'
      isValid = false
    }
    
    if (!formData.title) {
      newErrors.title = 'Content title is required'
      isValid = false
    }
    
    if (!formData.file_url && !uploadedFile) {
      newErrors.file_url = 'Please upload a file or provide a file URL'
      isValid = false
    }
    
    if (formData.order_number < 1) {
      newErrors.order_number = 'Order number must be at least 1'
      isValid = false
    }
    
    if (formData.content_type === 'video' && (formData.duration === null || formData.duration < 1)) {
      newErrors.duration = 'Duration is required for video content'
      isValid = false
    }
    
    if (formData.content_type === 'pdf' && (formData.page_count === null || formData.page_count < 1)) {
      newErrors.page_count = 'Page count is required for PDF content'
      isValid = false
    }
    
    setErrors(newErrors)
    return isValid
  }
  
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    
    // If there's a file uploaded but not yet processed, upload it first
    if (uploadedFile && !formData.file_url) {
      await uploadFile()
      
      // Check if upload succeeded
      if (!formData.file_url) {
        return
      }
    }
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/add-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminPassword,
          contentData: formData
        }),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setSuccess(true)
        // Reset file upload state
        setUploadedFile(null)
        setUploadProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        // Reset form data but keep the same book and chapter selected
        const currentChapterId = formData.chapter_id
        const currentContentType = formData.content_type
        setFormData({
          chapter_id: currentChapterId,
          title: '',
          description: '',
          content_type: currentContentType,
          file_url: '',
          duration: currentContentType === 'video' ? 0 : null,
          page_count: currentContentType === 'pdf' ? 0 : null,
          order_number: formData.order_number + 1, // Increment order number for convenience
          is_free: false
        })
      } else {
        setError(result.error || 'Failed to add content')
      }
    } catch (err) {
      setError('Error connecting to the server')
      console.error('Error adding content:', err)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <>
      <Head>
        <title>Admin - Add Content | Coursespace</title>
      </Head>
      
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
                <AdminPanelSettingsIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: '2rem' }} />
                Admin - Add Content
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
                      Content added successfully!
                    </Alert>
                  )}
                  
                  <Card>
                    <CardContent>
                      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
                        Add New Content
                      </Typography>
                      
                      <form onSubmit={handleSubmit}>
                        {/* Book Selection */}
                        <FormControl fullWidth sx={{ mb: 3 }}>
                          <InputLabel id="book-select-label">Book</InputLabel>
                          <Select
                            labelId="book-select-label"
                            id="book-select"
                            value={selectedBookId}
                            label="Book"
                            onChange={handleBookChange}
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
                        </FormControl>
                        
                        {/* Chapter Selection */}
                        <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.chapter_id} disabled={!selectedBookId}>
                          <InputLabel id="chapter-select-label">Chapter</InputLabel>
                          <Select
                            labelId="chapter-select-label"
                            id="chapter-select"
                            name="chapter_id"
                            value={formData.chapter_id}
                            label="Chapter"
                            onChange={handleChange}
                            disabled={fetchingChapters || !selectedBookId}
                          >
                            {fetchingChapters ? (
                              <MenuItem value="">
                                <CircularProgress size={20} sx={{ mr: 1 }} /> Loading chapters...
                              </MenuItem>
                            ) : !selectedBookId ? (
                              <MenuItem value="">
                                Please select a book first
                              </MenuItem>
                            ) : chapters.length === 0 ? (
                              <MenuItem value="">
                                No chapters found for this book
                              </MenuItem>
                            ) : (
                              chapters.map(chapter => (
                                <MenuItem key={chapter.id} value={chapter.id}>
                                  {chapter.title} (Order: {chapter.order_number})
                                </MenuItem>
                              ))
                            )}
                          </Select>
                          {errors.chapter_id && (
                            <Typography variant="caption" color="error">
                              {errors.chapter_id}
                            </Typography>
                          )}
                        </FormControl>
                        
                        <FormControl fullWidth sx={{ mb: 3 }}>
                          <InputLabel id="content-type-label">Content Type</InputLabel>
                          <Select
                            labelId="content-type-label"
                            id="content-type"
                            name="content_type"
                            value={formData.content_type}
                            label="Content Type"
                            onChange={handleContentTypeChange}
                          >
                            <MenuItem value="pdf">PDF Document</MenuItem>
                            <MenuItem value="video">Video</MenuItem>
                          </Select>
                        </FormControl>
                        
                        <TextField
                          label="Content Title"
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
                          label="Description (Optional)"
                          name="description"
                          fullWidth
                          multiline
                          rows={3}
                          variant="outlined"
                          value={formData.description}
                          onChange={handleChange}
                          sx={{ mb: 3 }}
                        />
                        
                        {/* File Upload Section */}
                        <Box 
                          sx={{ 
                            border: '2px dashed #ccc', 
                            borderRadius: 2, 
                            p: 3, 
                            mb: 3,
                            backgroundColor: '#fafafa',
                            textAlign: 'center',
                            position: 'relative',
                            '&:hover': {
                              borderColor: 'primary.main',
                              backgroundColor: 'rgba(0, 0, 0, 0.01)'
                            }
                          }}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept={formData.content_type === 'pdf' ? '.pdf' : 'video/*'}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                          />
                          
                          {uploadedFile ? (
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                {formData.file_url ? (
                                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                                ) : (
                                  <UploadFileIcon color="primary" sx={{ mr: 1 }} />
                                )}
                                <Typography variant="body1">
                                  {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
                                </Typography>
                              </Box>
                              
                              {uploading && (
                                <Box sx={{ width: '100%', mb: 2 }}>
                                  <LinearProgress variant="determinate" value={uploadProgress} />
                                  <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 1 }}>
                                    Uploading: {uploadProgress}%
                                  </Typography>
                                </Box>
                              )}
                              
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                                {!formData.file_url && (
                                  <StyledButton
                                    variant="contained"
                                    onClick={uploadFile}
                                    disabled={uploading}
                                    startIcon={<CloudUploadIcon />}
                                  >
                                    {uploading ? 'Uploading...' : 'Upload File'}
                                  </StyledButton>
                                )}
                                
                                <StyledButton 
                                  variant="outlined"
                                  onClick={() => {
                                    setUploadedFile(null)
                                    setFormData(prev => ({ ...prev, file_url: '' }))
                                    if (fileInputRef.current) {
                                      fileInputRef.current.value = ''
                                    }
                                  }}
                                >
                                  Remove File
                                </StyledButton>
                              </Box>
                            </Box>
                          ) : (
                            <Box 
                              onClick={() => fileInputRef.current?.click()}
                              sx={{ 
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                py: 3
                              }}
                            >
                              <CloudUploadIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                              <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                                {formData.content_type === 'pdf' ? 'Upload PDF Document' : 'Upload Video File'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Click or drag file here
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                {formData.content_type === 'pdf' 
                                  ? 'Accepted format: PDF' 
                                  : 'Accepted formats: MP4, WebM, MOV'
                                }
                              </Typography>
                            </Box>
                          )}
                          
                          {errors.file_url && (
                            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                              {errors.file_url}
                            </Typography>
                          )}
                        </Box>
                        
                        {/* Manual URL option */}
                        {!uploadedFile && (
                          <TextField
                            label="File URL (Alternative to uploading)"
                            name="file_url"
                            fullWidth
                            variant="outlined"
                            value={formData.file_url}
                            onChange={handleChange}
                            error={!!errors.file_url}
                            helperText={errors.file_url || "Enter the URL where the file is hosted"}
                            sx={{ mb: 3 }}
                          />
                        )}
                        
                        {formData.content_type === 'video' && (
                          <TextField
                            label="Duration (seconds)"
                            name="duration"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={formData.duration === null ? '' : formData.duration}
                            onChange={handleChange}
                            error={!!errors.duration}
                            helperText={errors.duration || "Enter the video duration in seconds"}
                            inputProps={{ min: 0 }}
                            sx={{ mb: 3 }}
                          />
                        )}
                        
                        {formData.content_type === 'pdf' && (
                          <TextField
                            label="Page Count"
                            name="page_count"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={formData.page_count === null ? '' : formData.page_count}
                            onChange={handleChange}
                            error={!!errors.page_count}
                            helperText={errors.page_count || "Enter the number of pages in the PDF"}
                            inputProps={{ min: 1 }}
                            sx={{ mb: 3 }}
                          />
                        )}
                        
                        <TextField
                          label="Order Number"
                          name="order_number"
                          type="number"
                          fullWidth
                          variant="outlined"
                          value={formData.order_number}
                          onChange={handleChange}
                          error={!!errors.order_number}
                          helperText={errors.order_number || "Determines the sequence of content in the chapter"}
                          inputProps={{ min: 1 }}
                          sx={{ mb: 3 }}
                        />
                        
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.is_free}
                              onChange={handleSwitchChange}
                              name="is_free"
                              color="primary"
                            />
                          }
                          label="Make content free for all users"
                          sx={{ mb: 3 }}
                        />
                        
                        <Divider sx={{ mb: 3 }} />
                        
                        <StyledButton
                          type="submit"
                          variant="contained"
                          disabled={loading || uploading}
                        >
                          {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Content'}
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

AdminAddContent.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default AdminAddContent 