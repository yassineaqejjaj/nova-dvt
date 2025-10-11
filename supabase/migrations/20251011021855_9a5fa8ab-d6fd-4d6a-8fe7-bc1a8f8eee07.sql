-- Ensure RLS policies for product_contexts support soft delete and activation
-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can soft delete their own contexts" ON public.product_contexts;
DROP POLICY IF EXISTS "Users can update their own contexts" ON public.product_contexts;

-- Create comprehensive UPDATE policy
CREATE POLICY "Users can update their own contexts"
ON public.product_contexts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure the policy allows updating is_deleted and is_active fields
COMMENT ON POLICY "Users can update their own contexts" ON public.product_contexts 
IS 'Allows users to update all fields including is_deleted (soft delete) and is_active on their own contexts';