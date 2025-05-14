import { supabase } from './supabaseClient';
import { User } from '@/types/database.types';

/**
 * Get the current user's profile
 * @returns User profile or null if not authenticated
 */
export const getUserProfile = async (): Promise<User | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();
    
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data as User;
};

/**
 * Check if a user has an active subscription
 * @param userId The user ID to check
 * @returns Boolean indicating if subscription is active
 */
export const isSubscriptionActive = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('subscription_end_date, is_active')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    
    const now = new Date();
    const endDate = new Date(data.subscription_end_date);
    
    return data.is_active && endDate > now;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};

/**
 * Find users by class and board
 * @param currentClass The class to filter by
 * @param board The board to filter by
 * @returns Array of matching users
 */
export const findUsersByClassAndBoard = async (
  currentClass: string, 
  board: string
): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('current_class', currentClass)
      .eq('board', board);
      
    if (error) throw error;
    return data as User[];
  } catch (error) {
    console.error('Error finding users by class and board:', error);
    return [];
  }
};

/**
 * Update a user's subscription end date
 * @param userId The user ID to update
 * @param months Number of months to extend (default: 12)
 * @returns Boolean indicating success
 */
export const extendSubscription = async (
  userId: string,
  months = 12
): Promise<boolean> => {
  try {
    // First get the current subscription end date
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('subscription_end_date')
      .eq('id', userId)
      .single();
      
    if (fetchError) throw fetchError;
    
    let newEndDate = new Date();
    
    // If current end date is in the future, extend from there
    // Otherwise extend from now
    const currentEndDate = new Date(userData.subscription_end_date);
    if (currentEndDate > newEndDate) {
      newEndDate = currentEndDate;
    }
    
    // Add months to the date
    newEndDate.setMonth(newEndDate.getMonth() + months);
    
    // Update the subscription date
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        subscription_end_date: newEndDate.toISOString(),
        is_active: true 
      })
      .eq('id', userId);
      
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error('Error extending subscription:', error);
    return false;
  }
}; 