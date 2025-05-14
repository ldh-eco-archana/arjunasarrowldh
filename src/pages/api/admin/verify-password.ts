import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Only allow admin operations in development mode
  const isDevelopment = process.env.NODE_ENV === 'development'
  if (!isDevelopment) {
    return res.status(403).json({ 
      error: 'Admin operations are restricted to development mode only',
      success: false
    })
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', success: false })
  }

  // Get the admin password from environment variables
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
  
  if (!ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD environment variable is not set')
    return res.status(500).json({ 
      error: 'Server configuration error: Admin password not set',
      success: false
    })
  }

  const { adminPassword } = req.body
  
  if (!adminPassword) {
    return res.status(400).json({ error: 'Password is required', success: false })
  }

  // Compare the provided password with the one from environment variables
  if (adminPassword === ADMIN_PASSWORD) {
    return res.status(200).json({ 
      message: 'Password verified successfully',
      success: true
    })
  } else {
    return res.status(401).json({ 
      error: 'Incorrect password',
      success: false
    })
  }
} 