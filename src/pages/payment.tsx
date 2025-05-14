import React from 'react'
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

const Payment: NextPageWithLayout = () => {
  const handlePayment = (): void => {
    // In a real implementation, this would connect to a payment gateway
    // For demonstration, we'll just redirect to a success page or external payment URL
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
        <Container maxWidth="md">
          <Typography component="h1" variant="h3" align="center" sx={{ mb: 6, fontWeight: 'bold' }}>
            Complete Your Course Subscription
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
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
            
            <Grid item xs={12} md={5}>
              <Card sx={{ borderRadius: 3, boxShadow: 5 }}>
                <CardContent sx={{ p: 4 }}>
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