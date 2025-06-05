import React, { FC } from 'react'
import Image from 'next/image'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Course } from '@/interfaces/course'

interface Props {
  item: Course
}

const CourseCardItem: FC<Props> = ({ item }) => {
  return (
    <Box
      sx={{
        px: 1,
        py: 4,
      }}
    >
      <Box
        sx={{
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 4,
          transition: (theme) => theme.transitions.create(['box-shadow']),
          '&:hover': {
            boxShadow: 2,
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            paddingTop: '100%', // 1:1 Aspect ratio
            overflow: 'hidden',
            borderRadius: 3,
            mb: 2,
          }}
        >
          <Image 
            src={item.cover} 
            alt={'Course ' + item.id}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography component="h2" variant="h5" sx={{ mb: 2, height: 56, overflow: 'hidden', fontSize: '1.2rem' }}>
            {item.title}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default CourseCardItem
