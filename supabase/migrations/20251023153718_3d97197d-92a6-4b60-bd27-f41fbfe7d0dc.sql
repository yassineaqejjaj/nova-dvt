-- Fix infinite recursion in nova_conversations RLS policies

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own conversations" ON public.nova_conversations;
DROP POLICY IF EXISTS "Users can view shared conversations" ON public.nova_conversations;

-- Create simplified policies without recursion
CREATE POLICY "Users can view their own conversations"
ON public.nova_conversations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
ON public.nova_conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
ON public.nova_conversations
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
ON public.nova_conversations
FOR DELETE
USING (auth.uid() = user_id);

-- Create a separate view for shared conversations access
CREATE OR REPLACE VIEW public.accessible_conversations AS
SELECT DISTINCT c.*
FROM public.nova_conversations c
WHERE c.user_id = auth.uid()
   OR c.id IN (
     SELECT conversation_id 
     FROM public.nova_shared_conversations 
     WHERE shared_with_user_id = auth.uid()
   );