import React from 'react'
import {
  Card,
  CardContent,
  CardActionArea,
  Box,
  Typography,
  Chip
} from '@mui/material'
import SchoolIcon from '@mui/icons-material/School'
import { CourseWithBooks } from '../types'

interface CourseCardProps {
  course: CourseWithBooks
  isSelected: boolean
  onClick: () => void
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, isSelected, onClick }) => {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        boxShadow: isSelected 
          ? '0 20px 40px rgba(102, 126, 234, 0.3)' 
          : '0 8px 32px rgba(0, 0, 0, 0.08)',
        border: isSelected 
          ? '2px solid #667eea' 
          : '1px solid rgba(255, 255, 255, 0.2)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.12)',
        }
      }}
      onClick={onClick}
    >
      <CardActionArea sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Course Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Box
              sx={{
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                flexShrink: 0
              }}
            >
              <SchoolIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: 'white' }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'rgba(0, 0, 0, 0.87)',
                  mb: 0.5,
                  lineHeight: 1.2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {course.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {course.board && (
                  <Chip
                    label={course.board}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      color: '#667eea',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 20
                    }}
                  />
                )}
                {course.class && (
                  <Chip
                    label={course.class}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(118, 75, 162, 0.1)',
                      color: '#764ba2',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 20
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>

          {/* Course Stats */}
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                {course.books.length} Book{course.books.length !== 1 ? 's' : ''}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                {course.books.reduce((acc, book) => acc + book.chapters.length, 0)} Chapters
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}