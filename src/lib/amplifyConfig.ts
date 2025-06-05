import { Amplify } from 'aws-amplify'

// Get environment variables
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID
const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID

// Only log in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('AmplifyConfig - Configuring Amplify...')
}

export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: userPoolId || '',
      userPoolClientId: userPoolClientId || ''
    }
  }
}

// Configure Amplify if on client side
if (typeof window !== 'undefined') {
  try {
    Amplify.configure(amplifyConfig)
    // Configuration successful
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('AmplifyConfig - Error configuring Amplify:', error)
    }
  }
}

export default amplifyConfig 