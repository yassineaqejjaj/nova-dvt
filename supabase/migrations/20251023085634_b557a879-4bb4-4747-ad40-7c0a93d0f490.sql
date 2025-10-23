-- Drop the problematic policy that allows viewing artifacts where product_context_id IS NULL without user check
DROP POLICY IF EXISTS "Users can view artifacts from their contexts" ON public.artifacts;

-- Create a corrected policy that ALWAYS checks user ownership
CREATE POLICY "Users can view artifacts from their contexts"
ON public.artifacts
FOR SELECT
TO authenticated
USING (
  (auth.uid() = user_id) AND 
  ((product_context_id IS NULL) OR (EXISTS (
    SELECT 1
    FROM product_contexts
    WHERE product_contexts.id = artifacts.product_context_id
      AND product_contexts.user_id = auth.uid()
  )))
);