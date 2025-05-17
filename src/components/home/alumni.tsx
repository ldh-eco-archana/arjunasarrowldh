import React, { FC, useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme, alpha } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import { motion } from 'framer-motion'
import InfoIcon from '@mui/icons-material/Info'
import { batchData } from './alumni.data'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel = (props: TabPanelProps): JSX.Element => {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`year-tabpanel-${index}`}
      aria-labelledby={`year-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 4 }}>{children}</Box>}
    </div>
  )
}

const a11yProps = (index: number): { id: string; 'aria-controls': string } => {
  return {
    id: `year-tab-${index}`,
    'aria-controls': `year-tabpanel-${index}`,
  }
}

const StudentCard: FC<{ name: string; delay: number }> = ({ name, delay }): JSX.Element => {
  const theme = useTheme()
  const firstLetter = name.charAt(0).toUpperCase()
  
  // Generate a consistent color based on the name
  const stringToColor = (str: string): string => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 70%, 85%)`
  }
  
  const avatarColor = stringToColor(name)
  const textColor = theme.palette.getContrastText(avatarColor)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay * 0.15 }}
    >
      <Card
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: { xs: 1.5, sm: 2 },
          backgroundColor: alpha(theme.palette.background.paper, 0.7),
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: theme.shadows[4],
          },
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Avatar
          sx={{
            width: { xs: 50, sm: 65 },
            height: { xs: 50, sm: 65 },
            mb: 1.5,
            bgcolor: avatarColor,
            color: textColor,
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
            fontWeight: 600,
            border: `3px solid ${theme.palette.background.paper}`,
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          {firstLetter}
        </Avatar>
        <CardContent sx={{ textAlign: 'center', p: { xs: 0.5, sm: 1 } }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 500,
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              color: theme.palette.primary.main,
            }}
          >
            {name}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const ComingSoonMessage: FC = (): JSX.Element => {
  const theme = useTheme()
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 3,
        textAlign: 'center',
      }}
    >
      <InfoIcon 
        sx={{ 
          fontSize: { xs: 40, md: 60 }, 
          color: theme.palette.primary.main,
          mb: 2 
        }} 
      />
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          color: theme.palette.primary.main,
          mb: 2,
        }}
      >
        Coming Soon
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: alpha(theme.palette.text.primary, 0.7),
          maxWidth: 500,
          mx: 'auto',
        }}
      >
        We&apos;re currently updating our archive of alumni from this batch. 
        Check back soon to explore more of our distinguished graduates!
      </Typography>
    </Box>
  )
}

const HomeSuccessStories: FC = () => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue)
  }

  // Determine which batches should show actual content vs "coming soon"
  const isComingSoon = (year: string): boolean => {
    const batchYear = parseInt(year.split('-')[0])
    return batchYear <= 2018
  }

  return (
    <Box
      id="alumni"
      sx={{
        pt: {
          xs: 6,
          md: 10,
        },
        pb: {
          xs: 8,
          md: 12,
        },
        background: `linear-gradient(to bottom, #f8f9fa, ${alpha(theme.palette.primary.light, 0.2)})`,
      }}
    >
      <Container maxWidth="lg">
        <Box 
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          sx={{ textAlign: 'center', mb: 5 }}
        >
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
              mb: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textFillColor: 'transparent',
            }}
          >
            Our Legacy of Excellence
          </Typography>
          
          <Typography
            variant="subtitle1"
            sx={{
              maxWidth: '800px',
              mx: 'auto',
              color: alpha(theme.palette.text.primary, 0.7),
              lineHeight: 1.6,
              mb: 4,
              px: { xs: 2, sm: 0 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
            }}
          >
            Explore our accomplished alumni from the past decade – each name represents a success story in economics education.
          </Typography>
        </Box>

        <Box
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            backgroundColor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: 'blur(8px)',
            boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.1)}`,
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="alumni batch years tabs"
            sx={{
              minHeight: { xs: 50, md: 60 },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
              '& .MuiTab-root': {
                minHeight: { xs: 50, md: 60 },
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                fontWeight: 600,
                color: alpha(theme.palette.text.primary, 0.7),
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                },
              },
              borderBottom: 1,
              borderColor: 'divider',
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
            }}
          >
            {batchData.map((batch, index) => (
              <Tab key={batch.id} label={`Batch ${batch.year}`} {...a11yProps(index)} />
            ))}
          </Tabs>

          {batchData.map((batch, index) => (
            <TabPanel key={batch.id} value={tabValue} index={index}>
              {isComingSoon(batch.year) ? (
                <ComingSoonMessage />
              ) : (
                <Grid container spacing={{ xs: 2, md: 3 }}>
                  {batch.students.map((student, idx) => (
                    <Grid item xs={6} sm={4} md={3} key={idx}>
                      <StudentCard name={student} delay={idx} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </TabPanel>
          ))}
        </Box>
      </Container>
    </Box>
  )
}

export default HomeSuccessStories 