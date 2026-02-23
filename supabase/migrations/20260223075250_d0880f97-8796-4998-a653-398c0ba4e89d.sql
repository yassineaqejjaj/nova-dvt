
-- Phase 3: Data & KPI Impact tables

-- Data Index: stores indexed data tables/columns/dashboards
CREATE TABLE public.data_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_context_id UUID REFERENCES public.product_contexts(id),
  table_name TEXT NOT NULL,
  columns TEXT[] DEFAULT '{}',
  description TEXT,
  source_type TEXT DEFAULT 'postgres', -- postgres, bigquery, snowflake
  used_by_dashboards TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.data_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own data index"
  ON public.data_index FOR ALL
  USING (auth.uid() = user_id);

CREATE TRIGGER update_data_index_updated_at
  BEFORE UPDATE ON public.data_index
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Feature-Data mapping: links features/artifacts to data tables
CREATE TABLE public.feature_data_map (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_id UUID NOT NULL REFERENCES public.artifacts(id) ON DELETE CASCADE,
  data_index_id UUID REFERENCES public.data_index(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  event_name TEXT,
  kpi_name TEXT,
  confidence NUMERIC DEFAULT 0.5,
  link_source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_data_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own feature data map"
  ON public.feature_data_map FOR ALL
  USING (auth.uid() = user_id);
