import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EmailIcon from '@mui/icons-material/Email'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import { StyledButton } from '@/components/styled-button'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import AlertTitle from '@mui/material/AlertTitle'

const HomeContact = (): JSX.Element => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'warning' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  })
  const [isOnline, setIsOnline] = useState<boolean>(true)

  // Monitor online/offline status
  React.useEffect(() => {
    const handleOnline = (): void => setIsOnline(true)
    const handleOffline = (): void => setIsOnline(false)
    
    // Check initial status
    setIsOnline(navigator.onLine)
    
    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    
    // Check if user is offline before attempting to submit
    if (!isOnline) {
      setSubmitStatus({
        open: true,
        message: 'You appear to be offline. Please check your internet connection and try again.',
        severity: 'error',
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }
      
      // Check if the response contains errors in the data object despite 200 status
      if (data.data?.adminEmail?.error || data.data?.autoResponse?.error) {
        const adminError = data.data.adminEmail?.error;
        const autoResponseError = data.data.autoResponse?.error;
        
        // Handle domain verification errors specifically
        if ((adminError?.message && adminError.message.includes('domain is not verified')) ||
            (autoResponseError?.message && autoResponseError.message.includes('domain is not verified'))) {
          throw new Error('DOMAIN_NOT_VERIFIED: Email domain is not verified. Please contact the administrator.');
        }
        
        // Handle other email service errors
        throw new Error(`EMAIL_SERVICE_ERROR: ${adminError?.message || autoResponseError?.message || 'Failed to send email'}`);
      }
      
      let successMessage = 'Your message has been sent successfully!'
      let severity: 'success' | 'warning' | 'error' | 'info' = 'success'
      
      // Check if in development mode
      if (data.isDevelopment) {
        successMessage = 'Development mode: Your message was processed, but no emails were sent. Set up the Resend API key to enable email functionality.'
        severity = 'warning'
      } 
      // Check if both emails were sent successfully
      else if (data.data?.adminEmail && data.data?.autoResponse) {
        successMessage = 'Your message has been sent successfully, and a confirmation email has been sent to your email address!'
      } else if (data.data?.adminEmail && data.data?.autoResponseError) {
        // Only admin email was sent
        successMessage = 'Your message has been received, but we could not send you a confirmation email. Please check your email address.'
        severity = 'warning'
      }
      
      // Success
      setSubmitStatus({
        open: true,
        message: successMessage,
        severity,
      })
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      })
      
    } catch (error) {
      console.error('Error submitting form:', error)
      
      // Get more specific error message from the error object
      let errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      let severity: 'error' | 'warning' = 'error'
      
      // Handle network errors specifically
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error: Please check your internet connection and try again.'
      }
      
      // Handle specific error codes from the backend
      if (error instanceof Error && error.message.includes('RATE_LIMIT_EXCEEDED')) {
        errorMessage = 'Our email service is currently busy. Please try again in a few minutes.'
      } else if (error instanceof Error && error.message.includes('INVALID_EMAIL')) {
        errorMessage = 'Please check your email address. It appears to be invalid or unable to receive emails.'
        severity = 'warning'
      } else if (error instanceof Error && error.message.includes('AUTH_ERROR')) {
        errorMessage = 'We\'re experiencing technical difficulties with our email service. Please contact us directly at arjunasarrowldh@gmail.com or try again later.'
      } else if (error instanceof Error && error.message.includes('DOMAIN_NOT_VERIFIED') || 
               errorMessage.includes('domain is not verified')) {
        errorMessage = 'We\'re experiencing technical difficulties with our email service configuration. Please contact us directly through email or phone. Our administrator has been notified.'
        
        // Add admin-specific message in development
        if (process.env.NODE_ENV === 'development') {
          errorMessage += '\n\nADMIN NOTICE: The email domain is not verified with Resend. Either verify the domain at https://resend.com or update the email "from" address to use a verified domain like "something@resend.dev".'
        }
        
        severity = 'warning'
      }
      
      // Error
      setSubmitStatus({
        open: true,
        message: errorMessage,
        severity,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseSnackbar = (): void => {
    setSubmitStatus((prev) => ({ ...prev, open: false }))
  }

  // Create a proper retry function
  const handleRetry = (): void => {
    const syntheticEvent = {
      preventDefault: (): void => { /* Empty implementation */ }
    } as React.FormEvent<HTMLFormElement>;
    
    handleSubmit(syntheticEvent);
  }

  return (
    <Box id="contact" sx={{ py: { xs: 8, md: 10 }, backgroundColor: 'background.paper' }}>
      <Container>
        <Grid container spacing={5}>
          <Grid item xs={12} md={5}>
            <Typography
              component="h2"
              sx={{
                position: 'relative',
                fontSize: { xs: 36, md: 46 },
                mt: { xs: 0, md: 7 },
                mb: 4,
                lineHeight: 1.3,
                fontWeight: 'bold',
              }}
            >
              Get in Touch 
              <Typography
                component="mark"
                sx={{
                  position: 'relative',
                  color: 'primary.main',
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                  backgroundColor: 'unset',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: { xs: 24, md: 34 },
                    left: 2,
                    transform: 'rotate(3deg)',
                    '& img': { width: { xs: 140, md: 175 }, height: 'auto' },
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/headline-curve.svg" alt="Headline curve" />
                </Box>
                With Us
              </Typography>
            </Typography>

            <Typography sx={{ color: 'text.secondary', mb: 4, fontSize: '1.1rem' }}>
              Have questions about our economics coaching? Send us a message and we&apos;ll get back to you as soon as possible.
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <LocationOnIcon sx={{ color: 'primary.main', mr: 2, fontSize: 22 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  1254 MIG, 32 Sec, Chandigarh Road, Ludhiana
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', mb: 2 }}>
                <EmailIcon sx={{ color: 'primary.main', mr: 2, fontSize: 22 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  arjunasarrowldh@gmail.com
                </Typography>
              </Box>

              <Box sx={{ display: 'flex' }}>
                <WhatsAppIcon sx={{ color: 'primary.main', mr: 2, fontSize: 22 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  +91-94179106509
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={7}>
            <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 3, md: 4 }, boxShadow: 3, borderRadius: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Send an Inquiry
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    label="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </Grid>
                {!isOnline && (
                  <Grid item xs={12}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      You appear to be offline. The contact form will not work until you reconnect to the internet.
                    </Alert>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Box sx={{ width: '100%', '& button': { width: '100%' } }}>
                    <StyledButton
                      type="submit"
                      color="primary"
                      variant="contained"
                      size="large"
                      disabled={isSubmitting || !isOnline}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Send Message'
                      )}
                    </StyledButton>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Snackbar 
        open={submitStatus.open} 
        autoHideDuration={submitStatus.severity === 'error' ? null : 6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={submitStatus.severity}
          sx={{ width: '100%' }}
          action={
            submitStatus.severity === 'error' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                <Button color="inherit" size="small" onClick={handleRetry}>
                  Retry
                </Button>
                <Button 
                  color="inherit" 
                  size="small" 
                  component="a" 
                  href="mailto:arjunasarrowldh@gmail.com"
                >
                  Email Directly
                </Button>
              </Box>
            )
          }
        >
          {submitStatus.severity === 'error' && <AlertTitle>Error Sending Message</AlertTitle>}
          {submitStatus.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default HomeContact 