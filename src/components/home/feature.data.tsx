import React, { ReactNode } from 'react'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import LocalAtmIcon from '@mui/icons-material/LocalAtm'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import GroupsIcon from '@mui/icons-material/Groups'

interface Data {
  title: string
  description: string
  icon?: ReactNode
}

export const data: Data[] = [
  {
    title: 'Comprehensive Study Material',
    description: 'Chapter-wise concise notes covering complete CBSE & ICSE Economics syllabus for XI & XII with key concepts and exam-focused content.',
    icon: <MenuBookIcon />,
  },
  {
    title: 'Affordable Learning Experience',
    description: 'Access premium economics education at competitive rates with options for offline coaching and online portal access for maximum value.',
    icon: <LocalAtmIcon />,
  },
  {
    title: 'Flexible Learning Schedule',
    description: 'Study Macroeconomics, Microeconomics, Indian Economy and Statistics at your own pace with 24/7 access to video lectures and study materials.',
    icon: <AccessTimeIcon />,
  },
  {
    title: 'Expert Economics Mentorship',
    description: 'Learn from experienced mentors with 14+ years of success in producing top scorers (90+) in CBSE and ICSE board exams.',
    icon: <GroupsIcon />,
  },
]
