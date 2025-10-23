-- Add product_context_id to artifacts table for project folder organization
ALTER TABLE public.artifacts
ADD COLUMN product_context_id UUID REFERENCES public.product_contexts(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_artifacts_product_context_id ON public.artifacts(product_context_id);

-- Update existing artifacts to inherit product_context_id from their PRD
UPDATE public.artifacts
SET product_context_id = prds.product_context_id
FROM public.prds
WHERE artifacts.prd_id = prds.id
  AND artifacts.product_context_id IS NULL;