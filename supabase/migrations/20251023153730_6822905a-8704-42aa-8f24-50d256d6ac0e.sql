-- Fix security definer view issue
DROP VIEW IF EXISTS public.accessible_conversations;

-- Instead, we'll handle shared conversations in the application code
-- No view needed, just proper RLS policies