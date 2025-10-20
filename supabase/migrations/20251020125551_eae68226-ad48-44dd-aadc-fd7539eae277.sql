-- Add metadata column to product_contexts table
ALTER TABLE public.product_contexts
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Add comment to document the column
COMMENT ON COLUMN public.product_contexts.metadata IS 'Additional context metadata including sprint duration, team size, tech stack, budget, and timeline';