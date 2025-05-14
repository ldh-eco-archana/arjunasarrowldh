import React, { useState, ChangeEvent, useEffect } from 'react'
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
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { countryCodes } from '@/data/countryCodes'
import { validatePhoneNumber, getPhoneNumberPlaceholder } from '@/utils/phoneValidation'

const Payment: NextPageWithLayout = () => {
  const [formStep, setFormStep] = useState(0)
  const [formData, setFormData] = useState({
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
  
  const handleNextStep = (): void => {
    // Check if there are any validation errors
    if (errors.email || errors.password || errors.confirmPassword || errors.mobile) {
      return
    }
    
    // Check if all required fields are filled
    const requiredFields = ['firstName', 'lastName', 'email', 'mobile', 'password', 'confirmPassword', 'schoolName', 'city', 'currentClass']
    const isValid = requiredFields.every(field => Boolean(formData[field as keyof typeof formData]))
    
    if (isValid) {
      setFormStep(1)
    } else {
      alert('Please fill in all required fields')
    }
  }
  
  const handlePayment = (): void => {
    // In a real implementation, this would connect to a payment gateway
    // For demonstration, we'll just redirect to a success page or external payment URL
    
    // Redirect to payment gateway
    window.location.href = 'https://example.com/payment' // Replace with actual payment gateway URL
  }

  return (
    <>
      <Head>
        <title>Payment | Economics E-Learning Portal</title>
        <meta 
          name="description" 
          content="Complete your payment to access our economics e-learning platform. Secure payment gateway for course subscription."
        />
      </Head>
      <Box sx={{ py: 12, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography component="h1" variant="h3" align="center" sx={{ mb: 6, fontWeight: 'bold' }}>
            Complete Your Course Subscription
          </Typography>
          
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={6} lg={5}>
              <Card sx={{ borderRadius: 3, boxShadow: 5, height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography component="h2" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Annual Economics Course Subscription
                  </Typography>
                  
                  <Box sx={{ my: 3, display: 'flex', alignItems: 'center' }}>
                    <CurrencyRupeeIcon color="primary" />
                    <Typography variant="h3" component="span" fontWeight="bold" sx={{ ml: 1 }}>
                      10,000
                    </Typography>
                    <Typography variant="subtitle1" component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                      / year
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AccessTimeIcon color="primary" />
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      Valid for 12 months from activation
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    {[
                      'Complete access to video lectures 24/7',
                      'Concise and elaborative PDF study materials',
                      'Practice tests and question papers',
                      'Expert doubt resolution support',
                      'Access to live webinars and workshops',
                      'Mobile and desktop access',
                    ].map((benefit, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircleOutlineIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">{benefit}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6} lg={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 5 }}>
                <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                  {formStep === 0 ? (
                    <>
                      <Typography component="h2" variant="h5" sx={{ mb: 4, fontWeight: 'bold' }}>
                        Your Details
                      </Typography>
                      
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
                            helperText={errors.email || "Will be used for login"}
                            error={!!errors.email}
                          />
                        </Grid>
                        <Grid item xs={12} sm={5} md={4}>
                          <FormControl fullWidth margin="normal" required>
                            <InputLabel>Country Code</InputLabel>
                            <Select
                              name="countryCode"
                              value={formData.countryCode}
                              label="Country Code"
                              onChange={handleChange}
                              MenuProps={{ 
                                PaperProps: { 
                                  sx: { maxHeight: 300 } 
                                } 
                              }}
                              renderValue={(selected) => {
                                const selectedCountry = countryCodes.find(option => option.value === selected);
                                return (
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography sx={{ mr: 1 }}>{selectedCountry?.flag}</Typography>
                                    <Typography>{selectedCountry?.value}</Typography>
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
                        <Grid item xs={12} sm={7} md={8}>
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
                        <Grid item xs={12} sm={6}>
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
                        <Grid item xs={12} sm={6}>
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
                              {[11, 12].map((cls) => (
                                <MenuItem key={cls} value={cls}>Class {cls}</MenuItem>
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
                              <FormControlLabel value="CBSE" control={<Radio />} label="CBSE" />
                              <FormControlLabel value="ICSE" control={<Radio />} label="ICSE" />
                            </RadioGroup>
                          </FormControl>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mt: 4 }}>
                        <StyledButton
                          onClick={handleNextStep}
                          variant="contained"
                          color="primary"
                          size="large"
                          sx={{ width: '100%', mb: 2 }}
                        >
                          Continue to Payment
                        </StyledButton>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Typography component="h2" variant="h5" sx={{ mb: 4, fontWeight: 'bold' }}>
                        Payment Details
                      </Typography>
                      
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold' }}>
                          What happens next:
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          1. Click on &quot;Proceed to Payment&quot; button below
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          2. Complete the payment on our secure payment gateway
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          3. After successful payment, you&apos;ll receive your login credentials via email
                        </Typography>
                        <Typography variant="body2">
                          4. Use these credentials to access your course materials instantly
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mt: 4 }}>
                        <StyledButton
                          onClick={handlePayment}
                          variant="contained"
                          color="primary"
                          size="large"
                          sx={{ width: '100%', mb: 2 }}
                        >
                          Proceed to Payment
                        </StyledButton>
                        
                        <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', mt: 2 }}>
                          By proceeding, you agree to our Terms of Service and Privacy Policy.
                          All payments are secured with industry-standard encryption.
                        </Typography>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  )
}

Payment.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default Payment 