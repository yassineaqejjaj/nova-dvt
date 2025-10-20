-- Add theme column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'nova-light';

-- Add comment to document the column
COMMENT ON COLUMN public.profiles.theme IS 'User selected theme preference';