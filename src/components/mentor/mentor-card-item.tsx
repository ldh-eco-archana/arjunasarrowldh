import React, { FC } from 'react'
import Image from 'next/image'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'

import { Alumni } from '@/interfaces/mentor'

interface Props {
  item: Alumni
}

const AlumniCardItem: FC<Props> = ({ item }) => {
  return (
    <Box
      sx={{
        px: 1.5,
        py: 5,
      }}
    >
      <Box
        sx={{
          p: 3,
          backgroundColor: 'background.paper',
          borderRadius: 4,
          transition: (theme) => theme.transitions.create(['box-shadow']),
          '&:hover': {
            boxShadow: 2,
          },
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <FormatQuoteIcon 
          sx={{ 
            position: 'absolute', 
            top: 10, 
            right: 10, 
            color: 'primary.main', 
            opacity: 0.3,
            fontSize: 40
          }} 
        />
        
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ mb: 2, color: 'text.secondary', fontStyle: 'italic' }} variant="body1">
            "{item.description}"
          </Typography>
        </Box>
        
        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              lineHeight: 0,
              overflow: 'hidden',
              borderRadius: '50%',
              width: 60,
              height: 60,
              mr: 2,
              flexShrink: 0,
            }}
          >
            <Image src={item.photo as string} width={60} height={60} alt={'Alumni ' + item.id} />
          </Box>
          
          <Box>
            <Typography component="h2" variant="h6" sx={{ fontWeight: 'bold' }}>
              {item.name}
            </Typography>
            <Typography sx={{ color: 'primary.main', fontWeight: 500 }}>{item.category}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {item.batch}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
export default AlumniCardItem
