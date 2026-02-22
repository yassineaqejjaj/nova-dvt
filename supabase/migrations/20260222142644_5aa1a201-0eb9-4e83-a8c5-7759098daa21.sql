
-- Phase 2: Code & Test Indexing tables

-- Code Index: tracks files/symbols from repositories
CREATE TABLE public.code_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_context_id UUID REFERENCES public.product_contexts(id),
  file_path TEXT NOT NULL,
  symbols TEXT[] DEFAULT '{}',
  description TEXT,
  language TEXT,
  last_commit TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.code_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own code index"
  ON public.code_index FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_code_index_user ON public.code_index(user_id);
CREATE INDEX idx_code_index_context ON public.code_index(product_context_id);

-- Feature-Code Map: links features/stories to code files
CREATE TABLE public.feature_code_map (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_id UUID NOT NULL REFERENCES public.artifacts(id) ON DELETE CASCADE,
  code_index_id UUID REFERENCES public.code_index(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  confidence NUMERIC DEFAULT 0.5,
  link_source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_code_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own feature code map"
  ON public.feature_code_map FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_feature_code_map_feature ON public.feature_code_map(feature_id);

-- Test Index: tracks test files and their relations
CREATE TABLE public.test_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_context_id UUID REFERENCES public.product_contexts(id),
  test_file TEXT NOT NULL,
  test_name TEXT,
  test_type TEXT DEFAULT 'unit',
  related_feature_id UUID REFERENCES public.artifacts(id) ON DELETE SET NULL,
  related_file_path TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.test_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own test index"
  ON public.test_index FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_test_index_user ON public.test_index(user_id);
CREATE INDEX idx_test_index_feature ON public.test_index(related_feature_id);

-- Trigger for updated_at on code_index
CREATE TRIGGER update_code_index_updated_at
  BEFORE UPDATE ON public.code_index
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on test_index
CREATE TRIGGER update_test_index_updated_at
  BEFORE UPDATE ON public.test_index
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
