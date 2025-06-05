import { signIn, signOut, signUp, getCurrentUser, getSession } from '@/lib/cognitoClient'

// Create a client interface that mimics Supabase for easier migration
export function createClient(): {
  auth: {
    signInWithPassword: (args: { email: string; password: string }) => Promise<any>
    signOut: () => Promise<any>
    signUp: (args: { email: string; password: string }) => Promise<any>
    getSession: () => Promise<any>
    getUser: () => Promise<any>
  }
} {
  return {
    auth: {
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        return await signIn(email, password)
      },
      signOut: async () => {
        return await signOut()
      },
      signUp: async ({ email, password }: { email: string; password: string }) => {
        return await signUp(email, password)
      },
      getSession: async () => {
        return await getSession()
      },
      getUser: async () => {
        const user = await getCurrentUser()
        return {
          data: { user },
          error: user ? null : new Error('No user found')
        }
      }
    }
  }
} 