-- Update existing profiles table to add is_admin and token_limit columns
-- Run this in your Supabase SQL editor to update the database schema

-- Add token_limit to profiles to support custom limits for users
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS token_limit INTEGER DEFAULT 10000;

-- Add is_admin to profiles to allow identifying admin users
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add an index on is_admin for faster lookups
CREATE INDEX IF NOT EXISTS profiles_is_admin_idx ON profiles(is_admin);

-- Note: To make someone an admin, you'll need to run an UPDATE query manually in the Supabase editor:
-- UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';
