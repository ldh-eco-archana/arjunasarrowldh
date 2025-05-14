import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EmailIcon from '@mui/icons-material/Email'
import { StyledButton } from '@/components/styled-button'

const HomeContact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Create mailto link with form data
    const subject = `Inquiry from ${formData.name}`
    const body = `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}

Message:
${formData.message}
    `
    
    window.location.href = `mailto:arjunasarrowldh@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
    })
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
              Have questions about our economics coaching? Send us a message and we'll get back to you as soon as possible.
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <LocationOnIcon sx={{ color: 'primary.main', mr: 2, fontSize: 22 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  MIG, 32 Sec, Chandigarh Road, Ludhiana
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
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
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
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledButton
                    type="submit"
                    color="primary"
                    variant="contained"
                    size="large"
                    fullWidth
                  >
                    Send Message
                  </StyledButton>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default HomeContact 