import { NextApiRequest, NextApiResponse } from 'next'
import { CognitoJwtVerifier } from 'aws-jwt-verify'
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'

// Initialize Cognito JWT Verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  tokenUse: 'access',
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
})

// Initialize Cognito client for admin operations
export const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_COGNITO_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export interface AuthenticatedUser {
  username: string
  email?: string
  groups: string[]
  isAdmin: boolean
  sub: string
}

export async function verifyAdminAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthenticatedUser | null> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        },
        timestamp: new Date().toISOString(),
      })
      return null
    }

    const token = authHeader.substring(7)

    // Verify the JWT token
    const payload = await verifier.verify(token)

    // Extract user information
    const username = payload.username || payload['cognito:username'] || ''
    const groups = (payload['cognito:groups'] as string[]) || []
    const isAdmin = groups.includes('Admin')

    // Check if user has admin privileges
    if (!isAdmin) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: This endpoint requires admin privileges. Please contact your administrator if you believe you should have access to this feature.',
        },
        timestamp: new Date().toISOString(),
      })
      return null
    }

    return {
      username: username as string,
      email: payload.email as string,
      groups,
      isAdmin,
      sub: payload.sub,
    }
  } catch (error) {
    console.error('Admin auth verification error:', error)
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
      timestamp: new Date().toISOString(),
    })
    return null
  }
}

// Helper function to validate group name format
export function isValidGroupName(groupName: string): boolean {
  // Group name must be 1-128 characters and contain only letters, numbers, underscores, and hyphens
  const groupNameRegex = /^[a-zA-Z0-9_-]{1,128}$/
  return groupNameRegex.test(groupName)
}

// Helper function to validate user pool ID configuration
export function validateUserPoolConfig(): boolean {
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID
  const region = process.env.NEXT_PUBLIC_COGNITO_REGION
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

  if (!userPoolId || !region || !accessKeyId || !secretAccessKey) {
    console.error('Missing required Cognito environment variables')
    return false
  }

  return true
}

// Standard error response helper
export function sendErrorResponse(
  res: NextApiResponse,
  code: string,
  message: string,
  statusCode: number
): void {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
    timestamp: new Date().toISOString(),
  })
}

// Standard success response helper
export function sendSuccessResponse(
  res: NextApiResponse,
  data: any,
  statusCode = 200
): void {
  res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  })
}