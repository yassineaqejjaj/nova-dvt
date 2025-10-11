-- Create product contexts table
CREATE TABLE public.product_contexts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  vision TEXT,
  objectives JSONB DEFAULT '[]'::jsonb,
  target_kpis JSONB DEFAULT '[]'::jsonb,
  constraints TEXT,
  target_audience TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create context history table for version tracking
CREATE TABLE public.context_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  context_id UUID NOT NULL REFERENCES public.product_contexts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_contexts
CREATE POLICY "Users can view their own contexts"
  ON public.product_contexts
  FOR SELECT
  USING (auth.uid() = user_id AND is_deleted = false);

CREATE POLICY "Users can create their own contexts"
  ON public.product_contexts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contexts"
  ON public.product_contexts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can soft delete their own contexts"
  ON public.product_contexts
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for context_history
CREATE POLICY "Users can view history of their own contexts"
  ON public.context_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.product_contexts
      WHERE product_contexts.id = context_history.context_id
        AND product_contexts.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert context history"
  ON public.context_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.product_contexts
      WHERE product_contexts.id = context_history.context_id
        AND product_contexts.user_id = auth.uid()
    )
  );

-- Function to save context version to history
CREATE OR REPLACE FUNCTION public.save_context_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_version INTEGER;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version), 0) + 1
  INTO next_version
  FROM public.context_history
  WHERE context_id = NEW.id;

  -- Save snapshot (keep only last 3 versions)
  INSERT INTO public.context_history (context_id, version, snapshot)
  VALUES (
    NEW.id,
    next_version,
    jsonb_build_object(
      'name', NEW.name,
      'vision', NEW.vision,
      'objectives', NEW.objectives,
      'target_kpis', NEW.target_kpis,
      'constraints', NEW.constraints,
      'target_audience', NEW.target_audience
    )
  );

  -- Keep only last 3 versions
  DELETE FROM public.context_history
  WHERE context_id = NEW.id
    AND version < (
      SELECT MAX(version) - 2
      FROM public.context_history
      WHERE context_id = NEW.id
    );

  RETURN NEW;
END;
$$;

-- Trigger to save version on update
CREATE TRIGGER save_context_version_trigger
  AFTER UPDATE ON public.product_contexts
  FOR EACH ROW
  WHEN (
    OLD.name IS DISTINCT FROM NEW.name OR
    OLD.vision IS DISTINCT FROM NEW.vision OR
    OLD.objectives IS DISTINCT FROM NEW.objectives OR
    OLD.target_kpis IS DISTINCT FROM NEW.target_kpis OR
    OLD.constraints IS DISTINCT FROM NEW.constraints OR
    OLD.target_audience IS DISTINCT FROM NEW.target_audience
  )
  EXECUTE FUNCTION public.save_context_version();

-- Trigger to update updated_at
CREATE TRIGGER update_product_contexts_updated_at
  BEFORE UPDATE ON public.product_contexts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_product_contexts_user_active ON public.product_contexts(user_id, is_active) WHERE is_deleted = false;
CREATE INDEX idx_context_history_context_version ON public.context_history(context_id, version DESC);