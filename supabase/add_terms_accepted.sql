-- Add terms_accepted field to profiles table
-- Run this in your Supabase SQL editor

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE;

-- Add comment to document the field
COMMENT ON COLUMN profiles.terms_accepted IS 'Whether the user has accepted the Terms of Service';
COMMENT ON COLUMN profiles.terms_accepted_at IS 'Timestamp when the user accepted the Terms of Service';
