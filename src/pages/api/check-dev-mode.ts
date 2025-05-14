import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse): void {
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // Return the environment mode
  res.status(200).json({ 
    isDevelopment,
    env: process.env.NODE_ENV
  })
} 