import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Only allow admin operations in development mode
  const isDevelopment = process.env.NODE_ENV === 'development'
  if (!isDevelopment) {
    return res.status(403).json({ 
      error: 'Admin operations are restricted to development mode only',
      status: 'failed'
    })
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Get admin password from environment variable
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
  
  if (!ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD environment variable is not set')
    return res.status(500).json({ 
      error: 'Server configuration error: Admin password not set', 
      status: 'failed'
    })
  }

  // Simple admin password verification
  const { adminPassword, userId } = req.body
  
  if (adminPassword !== ADMIN_PASSWORD) {
    console.log('adminPassword', adminPassword)
    console.log('ADMIN_PASSWORD', ADMIN_PASSWORD)
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ 
      error: 'Service role key is not configured on the server' 
    })
  }
  
  try {
    // First, check if the user exists in the auth.users table
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError) {
      console.error('Error fetching user:', userError);
      return res.status(404).json({ error: userError, message: 'User not found' });
    }

    if (!userData?.user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Important: First remove the user from the public.users table to remove foreign key constraints
    try {
      // Based on the Supabase Reference, we have a trigger that creates a user entry in public.users
      // We need to delete this before deleting from auth.users
      const { error: deleteUserError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (deleteUserError) {
        console.error('Error deleting from public.users table:', deleteUserError);
        
        // Continue anyway, as we want to try the auth deletion
        // The error might be that the user doesn't exist in the public.users table
      } else {
        console.log('Successfully deleted user from public.users table');
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
      // Continue with auth deletion anyway
    }
    
    // Now delete the user from auth.users using the admin client
    console.log('Attempting to delete user from auth.users table:', userId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Error deleting user from auth.users:', error);
      
      return res.status(500).json({ 
        error,
        message: 'Failed to delete user from auth.users. This may be due to remaining database constraints.'
      });
    }
    
    return res.status(200).json({ 
      message: 'User deleted successfully' 
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in delete user handler:', err);
    return res.status(500).json({ 
      error: err.message || 'An unknown error occurred',
      stack: process.env.NODE_ENV === 'development' ? (typeof err === 'object' && err !== null && 'stack' in err ? err.stack : undefined) : undefined
    });
  }
} 