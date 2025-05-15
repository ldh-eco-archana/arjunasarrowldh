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

### User-Course Relationship

Junction table to establish relationships between users and courses, with progress tracking.

```sql
CREATE TABLE public.user_courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0, -- Percentage progress (0-100)
  UNIQUE(user_id, course_id)
);
```

#### Indexes
```sql
CREATE INDEX idx_user_courses_user_id ON public.user_courses(user_id);
CREATE INDEX idx_user_courses_course_id ON public.user_courses(course_id);
```

#### Row Level Security
```sql
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;

-- Users can view their own course enrollments
CREATE POLICY user_courses_select_policy ON public.user_courses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY user_courses_update_policy ON public.user_courses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only admins can create/delete enrollments
CREATE POLICY user_courses_admin_policy ON public.user_courses
  FOR ALL
  USING (auth.role() = 'service_role');
```

#### Automatic Course Enrollment Trigger
```sql
CREATE OR REPLACE FUNCTION public.link_user_to_courses()
RETURNS TRIGGER AS $$
BEGIN
  -- Link user to courses matching their class and board
  INSERT INTO public.user_courses (user_id, course_id)
  SELECT 
    NEW.id, 
    courses.id
  FROM 
    public.courses
  WHERE 
    courses.class = NEW.current_class AND 
    courses.board = NEW.board;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_link_courses
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.link_user_to_courses();
```

### Courses Table

Table for storing course information organized by board and class.

```sql
CREATE TABLE public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  board TEXT NOT NULL,
  class TEXT NOT NULL,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Indexes
```sql
CREATE INDEX idx_courses_board ON public.courses(board);
CREATE INDEX idx_courses_class ON public.courses(class);
```

#### Row Level Security
```sql
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view courses
CREATE POLICY courses_view_policy ON public.courses
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can modify courses
CREATE POLICY courses_admin_policy ON public.courses
  FOR ALL
  USING (auth.role() = 'service_role');
```

### Books Table

Table for storing book information associated with courses.

```sql
CREATE TABLE public.books (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Indexes
```sql
CREATE INDEX idx_books_course_id ON public.books(course_id);
```

#### Row Level Security
```sql
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- All authenticated users with valid subscription can view books
CREATE POLICY books_view_policy ON public.books
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_active = true
      AND users.subscription_end_date > NOW()
    )
  );

-- Only admins can modify books
CREATE POLICY books_admin_policy ON public.books
  FOR ALL
  USING (auth.role() = 'service_role');
```

### Chapters Table

Table for storing chapter information organized by books.

```sql
CREATE TABLE public.chapters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(book_id, order_number)
);
```

#### Indexes
```sql
CREATE INDEX idx_chapters_book_id ON public.chapters(book_id);
CREATE INDEX idx_chapters_order_number ON public.chapters(order_number);
```

#### Row Level Security
```sql
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- All authenticated users with valid subscription can view chapters
CREATE POLICY chapters_view_policy ON public.chapters
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_active = true
      AND users.subscription_end_date > NOW()
    )
  );

-- Only admins can modify chapters
CREATE POLICY chapters_admin_policy ON public.chapters
  FOR ALL
  USING (auth.role() = 'service_role');
```

### Content Table

Table for storing educational content (PDFs and videos) for each chapter.

```sql
CREATE TABLE public.content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL, -- 'pdf' or 'video'
  file_url TEXT NOT NULL,
  duration INTEGER, -- For videos (in seconds)
  page_count INTEGER, -- For PDFs
  order_number INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chapter_id, order_number)
);
```

#### Indexes
```sql
CREATE INDEX idx_content_chapter_id ON public.content(chapter_id);
CREATE INDEX idx_content_content_type ON public.content(content_type);
CREATE INDEX idx_content_is_free ON public.content(is_free);
```

#### Row Level Security
```sql
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Free content can be viewed by any authenticated user
CREATE POLICY content_free_policy ON public.content
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    is_free = true
  );

-- Paid content can only be viewed by users with active subscriptions
CREATE POLICY content_paid_policy ON public.content
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_active = true
      AND users.subscription_end_date > NOW()
    )
  );

-- Only admins can modify content
CREATE POLICY content_admin_policy ON public.content
  FOR ALL
  USING (auth.role() = 'service_role');
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

### Get User Enrolled Courses

```typescript
// Get all courses a user is enrolled in
const getUserCourses = async (userId) => {
  const { data, error } = await supabase
    .from('user_courses')
    .select('*, courses(*)')
    .eq('user_id', userId);
    
  if (error) throw error;
  return data;
};
```

### Update User Course Progress

```typescript
// Update a user's progress in a course
const updateUserCourseProgress = async (userId, courseId, progress) => {
  const { data, error } = await supabase
    .from('user_courses')
    .update({ 
      progress: progress,
      last_accessed: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('course_id', courseId);
    
  if (error) throw error;
  return data;
};
```

### Get Courses by Board and Class

```typescript
// Get all courses for a specific board and class
const getCoursesByBoardAndClass = async (board, classLevel) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('board', board)
    .eq('class', classLevel);
    
  if (error) throw error;
  return data;
};
```

### Get Books by Course

```typescript
// Get all books for a specific course
const getBooksByCourse = async (courseId) => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('course_id', courseId);
    
  if (error) throw error;
  return data;
};
```

### Get Chapters by Book

```typescript
// Get all chapters for a specific book, ordered by sequence
const getChaptersByBook = async (bookId) => {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('book_id', bookId)
    .order('order_number', { ascending: true });
    
  if (error) throw error;
  return data;
};
```

### Get Content by Chapter

```typescript
// Get all content for a specific chapter, ordered by sequence
const getContentByChapter = async (chapterId) => {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('chapter_id', chapterId)
    .order('order_number', { ascending: true });
    
  if (error) throw error;
  return data;
};
```

### Get Free Content

```typescript
// Get all free content with related information
const getFreeContent = async () => {
  const { data, error } = await supabase
    .from('content')
    .select('*, chapters!inner(title, books!inner(title, courses!inner(name, board, class)))')
    .eq('is_free', true)
    .order('created_at', { ascending: false });
    
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

// User Course junction table interface
export interface UserCourse {
  id: string;
  user_id: string;
  course_id: string;
  created_at: string;
  last_accessed: string | null;
  progress: number;
}

// Course interface
export interface Course {
  id: string;
  name: string;
  description: string;
  board: string;
  class: string;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Book interface
export interface Book {
  id: string;
  course_id: string;
  title: string;
  description: string;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Chapter interface
export interface Chapter {
  id: string;
  book_id: string;
  title: string;
  description: string;
  order_number: number;
  created_at: string;
  updated_at: string;
}

// Content interface
export interface Content {
  id: string;
  chapter_id: string;
  title: string;
  description: string | null;
  content_type: 'pdf' | 'video';
  file_url: string;
  duration: number | null;
  page_count: number | null;
  order_number: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
}
```

## Helper Functions

```sql
-- Function to check if a user has an active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_subscribed BOOLEAN;
BEGIN
  SELECT (subscription_end_date > NOW() AND is_active = true)
  INTO is_subscribed
  FROM public.users
  WHERE id = user_id;
  
  RETURN COALESCE(is_subscribed, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
``` 