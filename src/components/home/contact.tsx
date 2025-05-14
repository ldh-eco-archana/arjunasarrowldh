import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EmailIcon from '@mui/icons-material/Email'
import { StyledButton } from '@/components/styled-button'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

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
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
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
      console.log('Contact form submission response:', data)
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }
      
      let successMessage = 'Your message has been sent successfully!'
      
      // Check if both emails were sent successfully
      if (data.data?.adminEmail && data.data?.autoResponse) {
        successMessage = 'Your message has been sent successfully, and a confirmation email has been sent to your email address!'
      } else if (data.data?.adminEmail && data.data?.autoResponseError) {
        // Only admin email was sent
        successMessage = 'Your message has been received, but we could not send you a confirmation email. Please check your email address.'
        console.warn('Auto-response failed:', data.data.autoResponseError)
      }
      
      // Success
      setSubmitStatus({
        open: true,
        message: successMessage,
        severity: 'success',
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
      // Error
      setSubmitStatus({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to send message',
        severity: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseSnackbar = (): void => {
    setSubmitStatus((prev) => ({ ...prev, open: false }))
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
              
              <Box sx={{ display: 'flex' }}>
                <EmailIcon sx={{ color: 'primary.main', mr: 2, fontSize: 22 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  arjunasarrowldh@gmail.com
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
                <Grid item xs={12}>
                  <Box sx={{ width: '100%', '& button': { width: '100%' } }}>
                    <StyledButton
                      type="submit"
                      color="primary"
                      variant="contained"
                      size="large"
                      disabled={isSubmitting}
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
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={submitStatus.severity}
          sx={{ width: '100%' }}
        >
          {submitStatus.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default HomeContact 