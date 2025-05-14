import { createClient, SupabaseClient, User, AuthResponse, AuthError } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceRoleKey = process.env.NEXT_SERVICE_ROLE_SUPABASE_KEY || ''

// Check if required environment variables are set
if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

if (!supabaseServiceRoleKey) {
  console.error('Missing NEXT_SERVICE_ROLE_SUPABASE_KEY environment variable')
}

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development'

// Create a regular client for standard operations
let supabase: SupabaseClient;
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} catch (error) {
  console.error('Error initializing regular Supabase client:', error)
  throw error
}

// Create a separate admin client with service role for admin operations
// Only create if in development mode AND the service role key is available
let supabaseAdmin: SupabaseClient | null = null
try {
  if (isDevelopment && supabaseServiceRoleKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  } else if (!isDevelopment) {
    console.warn('Admin Supabase client not initialized - production mode')
  } else {
    console.warn('Admin Supabase client not initialized - missing service role key')
  }
} catch (error) {
  console.error('Error initializing admin Supabase client:', error)
}

export { supabase, supabaseAdmin }

// Auth functions
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export const signOut = async (): Promise<{ error: Error | null }> => {
  return await supabase.auth.signOut()
}

export const signUp = async (email: string, password: string): Promise<AuthResponse> => {
  return await supabase.auth.signUp({
    email,
    password,
  })
}

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user || null
}

export const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
}

export const updatePassword = async (currentPassword: string, newPassword: string): Promise<{ 
  error: Error | null, 
  success: boolean 
}> => {
  try {
    // First verify the current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: (await getCurrentUser())?.email || '',
      password: currentPassword,
    })

    if (signInError) {
      return { error: new Error('Current password is incorrect'), success: false }
    }

    // If sign-in was successful, update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      return { error: updateError, success: false }
    }

    return { error: null, success: true }
  } catch (error) {
    return { 
      error: error instanceof Error ? error : new Error('An unknown error occurred'), 
      success: false 
    }
  }
}

// Admin function to create pre-verified users for testing
export const createAdminUser = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobile: string;
  schoolName: string;
  city: string;
  currentClass: string;
  board: string;
}): Promise<{
  data: { user: User } | null;
  error: AuthError | { message: string; code: string } | null;
}> => {
  // Check if we're in development mode
  if (!isDevelopment) {
    return { 
      data: null, 
      error: { 
        message: 'Admin operations are only available in development mode.',
        code: 'admin_dev_only'
      } 
    }
  }
  
  // Check if supabaseAdmin is initialized
  if (!supabaseAdmin) {
    console.error('Admin function called but supabaseAdmin is not initialized')
    return { 
      data: null, 
      error: { 
        message: 'Service role key is not configured. Please set NEXT_SERVICE_ROLE_SUPABASE_KEY in your environment variables.',
        code: 'service_role_missing'
      } 
    }
  }

  try {
    // Create the user with email verification pre-confirmed using the admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Pre-verify the email
      user_metadata: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        mobile: userData.mobile,
        school_name: userData.schoolName,
        city: userData.city,
        current_class: userData.currentClass,
        board: userData.board,
      },
    })

    if (authError) {
      console.error('Auth error during admin user creation:', authError)
      return { data: null, error: authError }
    }

    return { data: { user: authData.user }, error: null }
  } catch (error) {
    console.error('Unexpected error in createAdminUser function:', error)
    return { 
      data: null, 
      error: { 
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        code: 'admin_operation_failed'
      } 
    }
  }
} 