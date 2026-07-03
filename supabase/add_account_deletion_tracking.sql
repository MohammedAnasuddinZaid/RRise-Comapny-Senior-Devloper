-- Add account deletion tracking
-- Run this in your Supabase SQL editor

-- Add deleted_at column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- Add comment to document the fields
COMMENT ON COLUMN profiles.deleted_at IS 'Timestamp when the user account was deleted (null if active)';
COMMENT ON COLUMN profiles.deletion_reason IS 'Reason for account deletion (optional)';

-- Create index for querying deleted users
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at) WHERE deleted_at IS NOT NULL;

-- Create a function to handle account deletion
CREATE OR REPLACE FUNCTION soft_delete_user(user_id UUID, reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles 
  SET deleted_at = NOW(),
      deletion_reason = reason,
      email = email || '_deleted_' || EXTRACT(EPOCH FROM NOW())::TEXT -- Mark email as deleted
  WHERE id = user_id AND deleted_at IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION soft_delete_user TO authenticated;
