# Supabase Reference

This document serves as a reference for the Supabase database structure and API integration for the Coursespace application.

## Database Structure

### Users Table

The primary table for storing user information that extends beyond Supabase Auth's built-in user management.

```sql
CREATE TABLE public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  mobile TEXT,
  school_name TEXT,
  city TEXT,
  current_class TEXT,
  board TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '12 months',
  is_active BOOLEAN DEFAULT TRUE
);
```

#### Indexes
```sql
CREATE INDEX idx_users_current_class ON public.users(current_class);
CREATE INDEX idx_users_board ON public.users(board);
CREATE INDEX idx_users_city ON public.users(city);
CREATE INDEX idx_users_subscription_end_date ON public.users(subscription_end_date);
```

#### Row Level Security
```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_policy ON public.users
  FOR ALL
  USING (auth.uid() = id);
```

#### Automatic User Data Insertion
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    first_name,
    last_name,
    email,
    mobile,
    school_name,
    city,
    current_class,
    board
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email,
    NEW.raw_user_meta_data->>'mobile',
    NEW.raw_user_meta_data->>'school_name',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'current_class',
    NEW.raw_user_meta_data->>'board'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## API Integration

### Authentication

User authentication is handled through Supabase Auth. The admin creation endpoint at `src/pages/api/admin/create-user.ts` uses Supabase's admin client to create pre-verified users.

### User Creation API

#### Endpoint: `/api/admin/create-user`

This endpoint creates a new user with pre-verified email status. It's restricted to development mode for security.

**Request Body:**
```json
{
  "adminPassword": "your-admin-password",
  "userData": {
    "email": "user@example.com",
    "password": "userpassword",
    "firstName": "User",
    "lastName": "Name",
    "mobile": "1234567890",
    "schoolName": "School Name",
    "city": "City Name",
    "currentClass": "10",
    "board": "CBSE"
  }
}
```

**Response (Success):**
```json
{
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "...": "other user properties"
    }
  }
}
```

## Common Queries

### Get User Profile

```typescript
// Get the current user's profile
const getUserProfile = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();
    
  if (error) throw error;
  return data;
};
```

### Check Subscription Status

```typescript
// Check if user has an active subscription
const isSubscriptionActive = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('subscription_end_date, is_active')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  
  const now = new Date();
  const endDate = new Date(data.subscription_end_date);
  
  return data.is_active && endDate > now;
};
```

### Find Users by Class and Board

```typescript
// Find users by class and board
const findUsersByClassAndBoard = async (currentClass, board) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('current_class', currentClass)
    .eq('board', board);
    
  if (error) throw error;
  return data;
};
```

## Updating the Database

When you need to make changes to the database structure:

1. Connect to Supabase SQL Editor
2. Write and execute your ALTER TABLE statements
3. Update this reference document
4. Update any affected API endpoints or client code

## Best Practices

1. Always use TypeScript interfaces that match your database schema
2. Use RLS policies instead of manual permission checks when possible
3. Handle subscription expiry with server-side checks
4. Keep user metadata in auth.users and extended data in the users table

## TypeScript Interfaces

```typescript
// User interface matching the database schema
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
``` 