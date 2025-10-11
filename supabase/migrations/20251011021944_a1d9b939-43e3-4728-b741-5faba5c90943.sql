-- Fix RLS policies for product_contexts to allow INSERT
-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can create their own contexts" ON public.product_contexts;
DROP POLICY IF EXISTS "Users can view their own contexts" ON public.product_contexts;
DROP POLICY IF EXISTS "Users can update their own contexts" ON public.product_contexts;

-- CREATE policy - Allow users to insert contexts with their own user_id
CREATE POLICY "Users can create their own contexts"
ON public.product_contexts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- SELECT policy - Allow users to view their non-deleted contexts
CREATE POLICY "Users can view their own contexts"
ON public.product_contexts
FOR SELECT
USING (auth.uid() = user_id AND is_deleted = false);

-- UPDATE policy - Allow users to update their own contexts
CREATE POLICY "Users can update their own contexts"
ON public.product_contexts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);