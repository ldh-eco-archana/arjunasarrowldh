import React from 'react'
import { Box, Tabs, Tab } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant'
import GroupIcon from '@mui/icons-material/Group'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { a11yProps } from './common/TabPanel'

interface DashboardTabsProps {
  isAdmin: boolean
  tabValue: number
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  isAdmin,
  tabValue,
  onTabChange
}) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', position: 'relative' }}>
      <Tabs 
        value={tabValue} 
        onChange={onTabChange} 
        aria-label="dashboard tabs"
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTabs-indicator': {
            backgroundColor: '#4c51bf',
          },
          '& .MuiTab-root': {
            color: 'rgba(76, 81, 191, 0.7)',
            fontSize: { xs: '0.875rem', sm: '1rem' },
            minHeight: { xs: 48, sm: 64 },
            minWidth: { xs: 'auto', sm: 160 },
            textTransform: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            '&.Mui-selected': {
              color: '#4c51bf',
            },
            '&:hover': {
              color: '#4c51bf',
              backgroundColor: 'rgba(76, 81, 191, 0.04)',
            },
          },
          '& .MuiTabs-flexContainer': {
            justifyContent: { xs: 'flex-start', md: 'center' },
          },
        }}
      >
        <Tab 
          label={isAdmin ? "All Courses" : "Course Content"} 
          icon={isAdmin ? <DashboardIcon /> : <MenuBookIcon />}
          iconPosition="start"
          {...a11yProps(0)} 
        />
        <Tab 
          label="Notifications" 
          icon={<NotificationImportantIcon />}
          iconPosition="start"
          {...a11yProps(1)} 
        />
        <Tab 
          label="Users" 
          icon={<GroupIcon />}
          iconPosition="start"
          {...a11yProps(2)}
          sx={{ display: isAdmin ? 'inline-flex' : 'none' }}
        />
        <Tab 
          label="Groups" 
          icon={<AdminPanelSettingsIcon />}
          iconPosition="start"
          {...a11yProps(3)}
          sx={{ display: isAdmin ? 'inline-flex' : 'none' }}
        />
      </Tabs>
    </Box>
  )
}