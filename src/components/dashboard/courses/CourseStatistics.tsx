import React from 'react'
import { Grid, Card, CardContent, Typography } from '@mui/material'
import SchoolIcon from '@mui/icons-material/School'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import GroupIcon from '@mui/icons-material/Group'
import { CourseWithBooks } from '../types'

interface CourseStatisticsProps {
  courses: CourseWithBooks[]
  studentCount: number
}

export const CourseStatistics: React.FC<CourseStatisticsProps> = ({ courses, studentCount }) => {
  const totalBooks = courses.reduce((acc, course) => acc + course.books.length, 0)
  const totalChapters = courses.reduce(
    (acc, course) => acc + course.books.reduce(
      (bookAcc, book) => bookAcc + book.chapters.length, 0
    ), 0
  )

  const stats = [
    {
      icon: SchoolIcon,
      value: courses.length,
      label: 'Total Courses',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: MenuBookIcon,
      value: totalBooks,
      label: 'Total Books',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: AutoStoriesIcon,
      value: totalChapters,
      label: 'Total Chapters',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      icon: GroupIcon,
      value: studentCount,
      label: 'Total Users',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    }
  ]

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {stats.map((stat, index) => (
        <Grid item xs={6} md={3} key={index}>
          <Card sx={{ 
            borderRadius: 3,
            background: stat.gradient,
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
              <stat.icon sx={{ fontSize: { xs: 30, sm: 40 }, mb: 1, opacity: 0.9 }} />
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '1.5rem', sm: '2rem' } 
              }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" sx={{ 
                opacity: 0.9, 
                fontSize: { xs: '0.75rem', sm: '0.875rem' } 
              }}>
                {stat.label}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}