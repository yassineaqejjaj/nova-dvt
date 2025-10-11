-- Add unique constraint on user_id for user_sessions table
-- This enables the upsert operation with ON CONFLICT

ALTER TABLE public.user_sessions 
ADD CONSTRAINT user_sessions_user_id_key UNIQUE (user_id);