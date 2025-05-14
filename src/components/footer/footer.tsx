import React from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

const Footer = (): JSX.Element => (
  <Box component="footer" sx={{ backgroundColor: 'primary.main', py: 3, color: 'primary.contrastText' }}>
    <Container>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Arjuna&apos;s Arrow Economics
        </Typography>
        <Typography variant="body2">
          Empowering students with quality economics education since 2011
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 2 }}>
          © {new Date().getFullYear()} Arjuna&apos;s Arrow. All rights reserved.
        </Typography>
      </Box>
    </Container>
  </Box>
)

export default Footer
