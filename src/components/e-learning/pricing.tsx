import React, { FC } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { StyledButton } from '@/components/styled-button'
import Link from 'next/link'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

const ELearningPricing: FC = () => {
  return (
    <Box sx={{ py: { xs: 8, md: 10 }, backgroundColor: 'grey.50' }}>
      <Container>
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography
            component="h2"
            sx={{
              position: 'relative',
              fontSize: { xs: 36, md: 46 },
              mb: 2,
              lineHeight: 1.1,
              fontWeight: 'bold',
            }}
          >
            Subscription Plan
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2, px: { xs: 0, md: 8 } }}>
            Access all our premium economics learning materials with one simple plan
          </Typography>
        </Box>

        <Grid container justifyContent="center">
          <Grid item xs={12} md={8} lg={6}>
            <Card
              sx={{
                borderRadius: 4,
                boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0, 
                  backgroundColor: 'primary.main', 
                  color: 'white',
                  py: 1,
                  px: 3,
                  borderBottomLeftRadius: 12,
                  fontWeight: 'bold'
                }}
              >
                Best Value
              </Box>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>
                  Annual Subscription
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
                  ].map((benefit, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body1">{benefit}</Typography>
                    </Box>
                  ))}
                </Box>

                <Link href="/payment" passHref>
                  <StyledButton
                    color="primary"
                    size="large"
                    variant="contained"
                    sx={{ width: '100%' }}
                  >
                    Subscribe Now
                  </StyledButton>
                </Link>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default ELearningPricing 