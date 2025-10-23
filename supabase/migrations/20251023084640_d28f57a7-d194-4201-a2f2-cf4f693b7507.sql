-- Add RLS policies for artifacts with product_context_id
-- These policies ensure users can only see artifacts from their own product contexts

CREATE POLICY "Users can view artifacts from their contexts"
ON public.artifacts
FOR SELECT
USING (
  product_context_id IS NULL OR
  EXISTS (
    SELECT 1 FROM public.product_contexts
    WHERE product_contexts.id = artifacts.product_context_id
    AND product_contexts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create artifacts in their contexts"
ON public.artifacts
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  (product_context_id IS NULL OR
   EXISTS (
     SELECT 1 FROM public.product_contexts
     WHERE product_contexts.id = artifacts.product_context_id
     AND product_contexts.user_id = auth.uid()
   ))
);

CREATE POLICY "Users can update artifacts in their contexts"
ON public.artifacts
FOR UPDATE
USING (
  auth.uid() = user_id AND
  (product_context_id IS NULL OR
   EXISTS (
     SELECT 1 FROM public.product_contexts
     WHERE product_contexts.id = artifacts.product_context_id
     AND product_contexts.user_id = auth.uid()
   ))
);

CREATE POLICY "Users can delete artifacts in their contexts"
ON public.artifacts
FOR DELETE
USING (
  auth.uid() = user_id AND
  (product_context_id IS NULL OR
   EXISTS (
     SELECT 1 FROM public.product_contexts
     WHERE product_contexts.id = artifacts.product_context_id
     AND product_contexts.user_id = auth.uid()
   ))
);