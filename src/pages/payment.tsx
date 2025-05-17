import React, { useState, ChangeEvent } from 'react'
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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import TextField from '@mui/material/TextField'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import SendIcon from '@mui/icons-material/Send'
import SchoolIcon from '@mui/icons-material/School'
import LaptopIcon from '@mui/icons-material/Laptop'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import Avatar from '@mui/material/Avatar'
import Paper from '@mui/material/Paper'
import Fade from '@mui/material/Fade'
import Zoom from '@mui/material/Zoom'
import PersonIcon from '@mui/icons-material/Person'
import CallIcon from '@mui/icons-material/Call'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Button from '@mui/material/Button'

const Payment: NextPageWithLayout = () => {
  const [tabValue, setTabValue] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    message: ''
  })

  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue)
  }
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
    const phoneNumber = '+919417916509'; // Replace with actual teacher's WhatsApp number
    const formattedMessage = formatWhatsAppMessage();
    window.open(`https://wa.me/${phoneNumber}?text=${formattedMessage}`, '_blank');
  }

  const handleDirectCall = (): void => {
    window.location.href = 'tel:+919417916509';
  }

  return (
    <>
      <Head>
        <title>Connect with Teacher | Economics E-Learning Portal</title>
        <meta 
          name="description" 
          content="Connect directly with our experienced economics teacher. Get personalized guidance for your economics education journey."
        />
      </Head>
      <Box sx={{ py: 12, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Fade in={true} timeout={1000}>
            <Typography component="h1" variant="h3" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
              Connect with Our Expert Economics Teacher
            </Typography>
          </Fade>
          <Fade in={true} timeout={1500}>
            <Typography variant="h6" align="center" sx={{ mb: 6, color: 'text.secondary' }}>
              Fill in your details and connect directly with Mrs. Archana, our experienced economics faculty
            </Typography>
          </Fade>
          
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={6} lg={5}>
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
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          <SchoolIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">Experienced Educator</Typography>
                          <Typography variant="body2">With over 15 years of teaching experience and exceptional student results</Typography>
                        </Box>
                      </Box>
                    </Paper>
                    
                    <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2, backgroundColor: 'background.paper' }}>
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          <LaptopIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">Personalized Attention</Typography>
                          <Typography variant="body2">Customized study plans based on your specific needs and learning pace</Typography>
                        </Box>
                      </Box>
                    </Paper>
                    
                    <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2, backgroundColor: 'background.paper' }}>
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          <AssignmentTurnedInIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">Proven Results</Typography>
                          <Typography variant="body2">Join the ranks of students who have achieved excellent grades in economics</Typography>
                        </Box>
                      </Box>
                    </Paper>

                    <Box sx={{ mt: 4 }}>
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
                    
                    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button 
                        variant="contained" 
                        color="success" 
                        size="large" 
                        startIcon={<WhatsAppIcon />}
                        onClick={handleWhatsAppConnect}
                        sx={{ py: 1.5 }}
                      >
                        Message Directly on WhatsApp
                      </Button>
                      
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        size="large" 
                        startIcon={<CallIcon />}
                        onClick={handleDirectCall}
                        sx={{ py: 1.5 }}
                      >
                        Call Mrs. Archana: +91-9417916509
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
            
            <Grid item xs={12} md={6} lg={7}>
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
                      <Box>
                        <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
                          Send a Message to Mrs. Archana
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Your Name (Optional)"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              margin="normal"
                              variant="outlined"
                              placeholder="How should Mrs. Archana address you?"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Your Message (Optional)"
                              name="message"
                              value={formData.message}
                              onChange={handleChange}
                              margin="normal"
                              variant="outlined"
                              multiline
                              rows={4}
                              placeholder="Any specific topics or questions you're interested in?"
                            />
                          </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                          <StyledButton
                            onClick={handleWhatsAppConnect}
                            variant="contained"
                            color="primary"
                            size="large"
                            sx={{ py: 1.5, px: 4, fontSize: '1.1rem' }}
                            endIcon={<SendIcon />}
                          >
                            Send via WhatsApp
                          </StyledButton>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            No account creation required. Connect instantly!
                          </Typography>
                        </Box>
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
      </Box>
    </>
  )
}

Payment.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default Payment 