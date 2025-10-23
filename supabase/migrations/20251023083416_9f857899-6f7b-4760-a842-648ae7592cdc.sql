-- Fix search_path for security functions
DROP FUNCTION IF EXISTS public.update_prd_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Recreate update_updated_at_column with secure search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate update_prd_updated_at with secure search_path
CREATE OR REPLACE FUNCTION public.update_prd_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger for PRDs
CREATE TRIGGER update_prds_updated_at
  BEFORE UPDATE ON public.prds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_prd_updated_at();

-- Recreate triggers for other tables that use update_updated_at_column
CREATE TRIGGER update_artifacts_updated_at
  BEFORE UPDATE ON public.artifacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_contexts_updated_at
  BEFORE UPDATE ON public.product_contexts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();