/*
  # Add Push Notifications Support
  
  1. New Columns
    - Add expo_push_token to profiles table
  
  2. Security
    - Enable RLS on profiles table
    - Add policy for users to read/update their own profile
*/

-- Add expo_push_token to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);