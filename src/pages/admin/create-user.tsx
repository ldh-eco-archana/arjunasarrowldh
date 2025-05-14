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
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import LockIcon from '@mui/icons-material/Lock'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { countryCodes } from '@/data/countryCodes'
import { validatePhoneNumber, getPhoneNumberPlaceholder } from '@/utils/phoneValidation'

// Define shared type
interface UserData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  countryCode: string
  mobile: string
  schoolName: string
  city: string
  currentClass: string
  board: string
}

const AdminCreateUser: NextPageWithLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isDevMode, setIsDevMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Check if we're in development mode
  useEffect(() => {
    // In Next.js, process.env.NODE_ENV is available on client side if prefixed with NEXT_PUBLIC_
    // For this case, we'll check using a simple API call
    const checkDevMode = async (): Promise<void> => {
      try {
        const res = await fetch('/api/check-dev-mode');
        const data = await res.json();
        setIsDevMode(data.isDevelopment);
        
        if (!data.isDevelopment) {
          setError('Admin operations are only available in development mode');
        }
      } catch (err) {
        console.error('Failed to check development mode:', err);
        setError('Unable to verify development mode status');
      }
    };
    
    checkDevMode();
  }, []);
  
  const [formData, setFormData] = useState<UserData>({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+91',
    mobile: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
    city: '',
    currentClass: '',
    board: 'CBSE'
  })

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    mobile: ''
  })

  const [submitStatus, setSubmitStatus] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'warning' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  })
  
  // Update placeholder for mobile number based on selected country code
  const [mobilePlaceholder, setMobilePlaceholder] = useState(getPhoneNumberPlaceholder('+91'))
  
  useEffect(() => {
    // Set the placeholder based on selected country code
    setMobilePlaceholder(getPhoneNumberPlaceholder(formData.countryCode))
    
    // Validate mobile number when country code changes
    if (formData.mobile) {
      const { isValid, errorMessage } = validatePhoneNumber(formData.countryCode, formData.mobile)
      setErrors(prev => ({ ...prev, mobile: isValid ? '' : errorMessage }))
    }
  }, [formData.countryCode, formData.mobile])
  
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
      } else {
        setPasswordError('Invalid password')
      }
    } catch (err) {
      setPasswordError('Error verifying password')
      console.error('Password verification error:', err)
    }
  }
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent): void => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // For mobile number field, validate against the country code
    if (name === 'mobile') {
      const { isValid, errorMessage } = validatePhoneNumber(formData.countryCode, value)
      setErrors(prev => ({ ...prev, mobile: isValid ? '' : errorMessage }))
    }
  }
  
  useEffect(() => {
    // Validate email
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }))
      } else {
        setErrors(prev => ({ ...prev, email: '' }))
      }
    }
    
    // Validate password length
    if (formData.password) {
      if (formData.password.length < 6) {
        setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }))
      } else {
        setErrors(prev => ({ ...prev, password: '' }))
      }
    }
    
    // Check if passwords match
    if (formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }))
      }
    }
  }, [formData.email, formData.password, formData.confirmPassword])
  
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    
    // Phone number validation
    const { isValid, errorMessage } = validatePhoneNumber(formData.countryCode, formData.mobile)
    if (!isValid) {
      setError(`Invalid phone number: ${errorMessage}`)
      setLoading(false)
      return
    }

    if (!isDevMode) {
      setError('Admin operations are restricted to development mode only')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminPassword,
          userData: {
            ...formData,
            // Combine country code and mobile
            mobile: `${formData.countryCode}${formData.mobile}`
          }
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || result.error || 'Failed to create user')
      }

      // Success
      setSuccess(true)
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        countryCode: '+91',
        mobile: '',
        password: '',
        confirmPassword: '',
        schoolName: '',
        city: '',
        currentClass: '',
        board: 'CBSE'
      })
      setAdminPassword('')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Board options
  const boardOptions = [
    { value: 'CBSE', label: 'CBSE' },
    { value: 'ICSE', label: 'ICSE' }
  ]
  
  // Class options
  const classOptions = [
    { value: '11', label: '11th' },
    { value: '12', label: '12th' }
  ]

  return (
    <>
      <Head>
        <title>Admin | Create User</title>
        <meta 
          name="robots" 
          content="noindex,nofollow"
        />
      </Head>
      <Box sx={{ py: 10, backgroundColor: 'background.default', minHeight: '100vh' }}>
        <Container maxWidth="md">
          {!isAuthenticated ? (
            <Card sx={{ borderRadius: 3, boxShadow: 5, maxWidth: 500, mx: 'auto' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
                  <LockIcon color="error" fontSize="large" sx={{ mr: 2 }} />
                  <Typography component="h1" variant="h4" align="center" sx={{ fontWeight: 'bold' }}>
                    Admin Access
                  </Typography>
                </Box>
                
                <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                  This is a secured area. Please enter the admin password to continue.
                </Typography>
                
                {passwordError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {passwordError}
                  </Alert>
                )}
                
                <Box component="form" onSubmit={handlePasswordSubmit}>
                  <TextField
                    fullWidth
                    label="Admin Password"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    margin="normal"
                    required
                    sx={{ mb: 3 }}
                  />
                  
                  <StyledButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ width: '100%' }}
                  >
                    Access Admin Area
                  </StyledButton>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
                <AdminPanelSettingsIcon color="primary" fontSize="large" sx={{ mr: 2 }} />
                <Typography component="h1" variant="h3" align="center" sx={{ fontWeight: 'bold' }}>
                  Admin: Create User
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
                <LockIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="body2" color="error">
                  This is a secured page for admin use only
                </Typography>
              </Box>
              
              {submitStatus.open && (
                <Alert 
                  severity={submitStatus.severity} 
                  sx={{ mb: 4 }}
                  onClose={() => setSubmitStatus(prev => ({ ...prev, open: false }))}
                >
                  {submitStatus.message}
                </Alert>
              )}
              
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 4 }}
                >
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert 
                  severity="success" 
                  sx={{ mb: 4 }}
                >
                  User has been created successfully.
                </Alert>
              )}
              
              <Card sx={{ borderRadius: 3, boxShadow: 5 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography component="h2" variant="h5" sx={{ mb: 4, fontWeight: 'bold' }}>
                    Create Pre-Verified User
                  </Typography>
                  
                  <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          margin="normal"
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          margin="normal"
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          margin="normal"
                          required
                          helperText={errors.email || "Will be used for login and will be pre-verified"}
                          error={!!errors.email}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth margin="normal" required>
                          <InputLabel>Country Code</InputLabel>
                          <Select
                            name="countryCode"
                            value={formData.countryCode}
                            label="Country Code"
                            onChange={handleChange}
                            renderValue={(selected) => {
                              const selectedCountry = countryCodes.find(option => option.value === selected);
                              return (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography sx={{ mr: 1 }}>{selectedCountry?.flag}</Typography>
                                  <Typography>{selectedCountry?.label}</Typography>
                                </Box>
                              );
                            }}
                          >
                            {countryCodes.map(option => (
                              <MenuItem key={option.value} value={option.value}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography sx={{ mr: 1, fontSize: '1.2rem' }}>{option.flag}</Typography>
                                  <Typography>{option.label}</Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          fullWidth
                          label="Mobile Number"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleChange}
                          margin="normal"
                          required
                          type="tel"
                          placeholder={mobilePlaceholder}
                          error={!!errors.mobile}
                          helperText={errors.mobile || mobilePlaceholder}
                          inputProps={{
                            inputMode: 'numeric',
                            pattern: '[0-9]*'
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleChange}
                          margin="normal"
                          required
                          helperText={errors.password || "Minimum 6 characters"}
                          error={!!errors.password}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Confirm Password"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          margin="normal"
                          required
                          helperText={errors.confirmPassword || ""}
                          error={!!errors.confirmPassword}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="School Name"
                          name="schoolName"
                          value={formData.schoolName}
                          onChange={handleChange}
                          margin="normal"
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="City"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          margin="normal"
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="normal" required>
                          <InputLabel>Class</InputLabel>
                          <Select
                            name="currentClass"
                            value={formData.currentClass}
                            label="Class"
                            onChange={handleChange}
                          >
                            {classOptions.map(option => (
                              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl component="fieldset" margin="normal" required>
                          <Typography variant="body2" sx={{ mb: 1 }}>Board</Typography>
                          <RadioGroup
                            row
                            name="board"
                            value={formData.board}
                            onChange={handleChange}
                          >
                            {boardOptions.map(option => (
                              <FormControlLabel key={option.value} value={option.value} control={<Radio />} label={option.label} />
                            ))}
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 4 }}>
                      <StyledButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{ width: '100%', mb: 2 }}
                        disabled={loading || !isDevMode}
                      >
                        {loading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          'Create Pre-Verified User'
                        )}
                      </StyledButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </>
          )}
        </Container>
      </Box>
    </>
  )
}

AdminCreateUser.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default AdminCreateUser 