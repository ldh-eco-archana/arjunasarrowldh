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
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Avatar from '@mui/material/Avatar'
import PersonIcon from '@mui/icons-material/Person'
import CallIcon from '@mui/icons-material/Call'
import SendIcon from '@mui/icons-material/Send'
import Paper from '@mui/material/Paper'
import SchoolIcon from '@mui/icons-material/School'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import Fade from '@mui/material/Fade'
import Zoom from '@mui/material/Zoom'

const HomeContact = (): JSX.Element => {
  const [tabValue, setTabValue] = useState(0)
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue)
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

  const formatWhatsAppMessage = (): string => {
    // Create a formatted message for WhatsApp
    const baseMessage = `Hello Mrs. Archana! I'm interested in economics coaching.`
    
    // Add name if provided
    const nameSection = formData.name ? `\n\nMy name is ${formData.name}.` : ''
    
    // Add custom message if provided
    const customMessage = formData.message ? `\n\n${formData.message}` : ''
    
    // Combine all sections
    const message = `${baseMessage}${nameSection}${customMessage}\n\nPlease provide me more information about your coaching services. Thank you!`;
    
    return encodeURIComponent(message);
  }
  
  const handleWhatsAppConnect = (): void => {
    const phoneNumber = '919417916509'; // Without the + for WhatsApp API
    const formattedMessage = formatWhatsAppMessage();
    window.open(`https://wa.me/${phoneNumber}?text=${formattedMessage}`, '_blank');
  }

  const handleDirectCall = (): void => {
    window.location.href = 'tel:+919417916509';
  }

  return (
    <Box id="contact" sx={{ py: { xs: 8, md: 10 }, backgroundColor: 'background.paper' }}>
      <Container>
        <Fade in={true} timeout={1000}>
          <Typography
            component="h2"
            align="center"
            sx={{
              position: 'relative',
              fontSize: { xs: 36, md: 46 },
              mb: 6,
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
        </Fade>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={5} lg={5}>
            <Zoom in={true} timeout={1000}>
              <Card sx={{ borderRadius: 3, boxShadow: 5, height: '100%', position: 'relative', overflow: 'visible' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mr: 2 }}>
                      <PersonIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Box>
                      <Typography component="h2" variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Mrs. Archana
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        Economics Expert • 15+ Years Experience
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 4 }}>
                    Mrs. Archana has helped hundreds of students excel in their economics examinations with her unique 
                    teaching methodology that simplifies complex concepts and makes learning enjoyable.
                  </Typography>
                  
                  <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2, backgroundColor: 'background.paper' }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <SchoolIcon sx={{ color: 'primary.main', mr: 2, fontSize: 22 }} />
                      <Box>
                        <Typography variant="h6" fontWeight="bold">Expert Faculty</Typography>
                        <Typography variant="body2">Learn from an expert with over 15 years of teaching experience</Typography>
                      </Box>
                    </Box>
                  </Paper>
                  
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', mb: 2, alignItems: 'flex-start' }}>
                      <LocationOnIcon sx={{ color: 'primary.main', mr: 2, fontSize: 22, mt: 0.5 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        1254 MIG, 32 Sec, Chandigarh Road, Ludhiana
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', mb: 2, alignItems: 'flex-start' }}>
                      <EmailIcon sx={{ color: 'primary.main', mr: 2, fontSize: 22, mt: 0.5 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        arjunasarrowldh@gmail.com
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <WhatsAppIcon sx={{ color: 'primary.main', mr: 2, fontSize: 22, mt: 0.5 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        +91-9417916509
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Benefits of Our Economics Coaching:
                    </Typography>
                    {[
                      'Complete access to video lectures 24/7',
                      'Concise and elaborative PDF study materials',
                      'Practice tests and question papers',
                      'Expert doubt resolution support',
                      'Access to live webinars and workshops',
                    ].map((benefit, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircleOutlineIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">{benefit}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
          
          <Grid item xs={12} md={7} lg={7}>
            <Zoom in={true} timeout={1200}>
              <Card sx={{ borderRadius: 3, boxShadow: 5, position: 'relative' }}>
                <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="contact options">
                      <Tab label="Quick Contact" />
                      <Tab label="Send a Message" />
                    </Tabs>
                  </Box>
                  
                  {tabValue === 0 && (
                    <Box>
                      <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
                        Connect with Mrs. Archana in seconds!
                      </Typography>
                      
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="body1" sx={{ mb: 4, maxWidth: '500px', mx: 'auto' }}>
                          Ready to excel in Economics? Our simple, two-click process gets you directly connected with Mrs. Archana, no lengthy forms needed!
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: '400px', mx: 'auto', gap: 3 }}>
                          <StyledButton
                            onClick={handleWhatsAppConnect}
                            variant="contained"
                            color="primary"
                            size="large"
                            sx={{ py: 2, fontSize: '1.1rem' }}
                            startIcon={<WhatsAppIcon sx={{ fontSize: '1.5rem' }} />}
                          >
                            Chat on WhatsApp
                          </StyledButton>
                          
                          <Button
                            variant="outlined"
                            color="primary"
                            size="large"
                            sx={{ py: 2, fontSize: '1.1rem' }}
                            onClick={handleDirectCall}
                            startIcon={<CallIcon sx={{ fontSize: '1.5rem' }} />}
                          >
                            Call +91-9417916509
                          </Button>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
                          Mrs. Archana responds to most messages within 1-2 hours
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  
                  {tabValue === 1 && (
                    <Box component="form" onSubmit={handleSubmit}>
                      <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
                        Send a Message to Mrs. Archana
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            required
                            fullWidth
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            margin="normal"
                            variant="outlined"
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
                            margin="normal"
                            variant="outlined"
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
                            margin="normal"
                            variant="outlined"
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
                            margin="normal"
                            variant="outlined"
                            placeholder="Any specific topics or questions you're interested in?"
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
                          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <StyledButton
                              type="submit"
                              color="primary"
                              variant="contained"
                              size="large"
                              disabled={isSubmitting || !isOnline}
                              sx={{ py: 1.5, flexGrow: 1 }}
                              endIcon={<SendIcon />}
                            >
                              {isSubmitting ? (
                                <CircularProgress size={24} color="inherit" />
                              ) : (
                                'Send Message'
                              )}
                            </StyledButton>
                            
                            <Button
                              onClick={handleWhatsAppConnect}
                              variant="outlined"
                              color="primary"
                              size="large"
                              sx={{ py: 1.5 }}
                              startIcon={<WhatsAppIcon />}
                            >
                              Send via WhatsApp
                            </Button>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            We usually respond within 1-2 business hours
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                  
                  <Box sx={{ mt: 6, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                      Why Students Love Learning with Mrs. Archana:
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1 }}>
                      &quot;Mrs. Archana&apos;s teaching approach made complex economic concepts so much easier to understand. I scored 98/100 in my finals!&quot; - Vipul
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1 }}>
                      &quot;The personalized attention and study materials were exactly what I needed. Highly recommended!&quot; - Nidhi
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
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