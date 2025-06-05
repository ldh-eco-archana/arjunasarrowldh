// Remove next/server imports and create a session utility file
// This file should handle Cognito session utilities without direct middleware dependencies

// Types for request can be defined here without next/server
type RequestLike = {
  headers: {
    get(name: string): string | null;
  };
}

// Helper function to check if user has valid Cognito tokens
export function hasValidCognitoSession(request: RequestLike): boolean {
  // Check for AWS Cognito tokens in cookies
  // The actual cookie names may vary based on your Amplify configuration
  const cognitoCookies = [
    'CognitoIdentityServiceProvider',
    'amplify-authenticator-authState'
  ]
  
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return false
  
  // Look for any Cognito-related cookies
  return cognitoCookies.some(cookieName => 
    cookieHeader.includes(cookieName)
  )
} 