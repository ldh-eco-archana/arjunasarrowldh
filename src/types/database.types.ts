/**
 * User interface matching the database schema
 */
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string | null;
  school_name: string | null;
  city: string | null;
  current_class: string | null;
  board: string | null;
  created_at: string;
  subscription_start_date: string;
  subscription_end_date: string;
  is_active: boolean;
}

/**
 * Database schema type definitions
 * This helps with type checking when using Supabase client
 */
export type DatabaseSchema = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'subscription_start_date' | 'subscription_end_date'>;
        Update: Partial<Omit<User, 'id'>>;
      };
      // Add other tables here as your schema grows
    };
  };
};

// Note: We don't need to import Database from supabase-js
// Supabase client will still work with our types
export type SupabaseDatabase = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'subscription_start_date' | 'subscription_end_date'>;
        Update: Partial<Omit<User, 'id'>>;
      };
    };
  };
}; 