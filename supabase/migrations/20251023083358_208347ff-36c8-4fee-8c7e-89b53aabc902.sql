-- Create PRDs table to store generated Product Requirements Documents
CREATE TABLE IF NOT EXISTS public.prds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  idea_description TEXT NOT NULL,
  document_content JSONB NOT NULL,
  product_context_id UUID REFERENCES public.product_contexts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on PRDs
ALTER TABLE public.prds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for PRDs
CREATE POLICY "Users can create their own PRDs"
  ON public.prds
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own PRDs"
  ON public.prds
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own PRDs"
  ON public.prds
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own PRDs"
  ON public.prds
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add prd_id column to artifacts table
ALTER TABLE public.artifacts 
ADD COLUMN IF NOT EXISTS prd_id UUID REFERENCES public.prds(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_artifacts_prd_id ON public.artifacts(prd_id);
CREATE INDEX IF NOT EXISTS idx_prds_user_id ON public.prds(user_id);
CREATE INDEX IF NOT EXISTS idx_prds_context_id ON public.prds(product_context_id);

-- Create trigger to update updated_at on PRDs
CREATE OR REPLACE FUNCTION public.update_prd_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prds_updated_at
  BEFORE UPDATE ON public.prds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_prd_updated_at();