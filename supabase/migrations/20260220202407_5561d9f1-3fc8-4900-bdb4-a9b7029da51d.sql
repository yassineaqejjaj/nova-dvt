
-- Artefact versions for tracking changes
CREATE TABLE public.artefact_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artefact_id UUID NOT NULL REFERENCES public.artifacts(id) ON DELETE CASCADE,
  previous_version_id UUID REFERENCES public.artefact_versions(id),
  content JSONB NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  author_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.artefact_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own artefact versions"
  ON public.artefact_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.artifacts WHERE artifacts.id = artefact_versions.artefact_id AND artifacts.user_id = auth.uid()
  ));

CREATE POLICY "Users insert own artefact versions"
  ON public.artefact_versions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.artifacts WHERE artifacts.id = artefact_versions.artefact_id AND artifacts.user_id = auth.uid()
  ));

-- Change sets: classified diffs
CREATE TABLE public.change_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artefact_version_id UUID NOT NULL REFERENCES public.artefact_versions(id) ON DELETE CASCADE,
  changes_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.change_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own change sets"
  ON public.change_sets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.artefact_versions av
    JOIN public.artifacts a ON a.id = av.artefact_id
    WHERE av.id = change_sets.artefact_version_id AND a.user_id = auth.uid()
  ));

CREATE POLICY "Users insert own change sets"
  ON public.change_sets FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.artefact_versions av
    JOIN public.artifacts a ON a.id = av.artefact_id
    WHERE av.id = change_sets.artefact_version_id AND a.user_id = auth.uid()
  ));

-- Knowledge graph: artefact links
CREATE TABLE public.artefact_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID NOT NULL REFERENCES public.artifacts(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL, -- 'artefact' | 'feature' | 'code' | 'test' | 'kpi'
  target_id TEXT NOT NULL,
  link_type TEXT NOT NULL, -- 'defines' | 'implements' | 'measured_by' | 'depends_on'
  confidence_score NUMERIC DEFAULT 0.5,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.artefact_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own artefact links"
  ON public.artefact_links FOR ALL
  USING (auth.uid() = user_id);

-- Impact runs
CREATE TABLE public.impact_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_change_set_id UUID REFERENCES public.change_sets(id),
  artefact_id UUID NOT NULL REFERENCES public.artifacts(id) ON DELETE CASCADE,
  artefact_version_id UUID REFERENCES public.artefact_versions(id),
  impact_score NUMERIC DEFAULT 0,
  summary JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | running | completed | failed
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.impact_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own impact runs"
  ON public.impact_runs FOR ALL
  USING (auth.uid() = user_id);

-- Impact items (individual impacted elements)
CREATE TABLE public.impact_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  impact_run_id UUID NOT NULL REFERENCES public.impact_runs(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  item_type TEXT NOT NULL, -- 'documentation' | 'backlog' | 'spec' | 'test' | 'code' | 'kpi' | 'data'
  impact_score NUMERIC DEFAULT 0,
  impact_reason TEXT,
  review_status TEXT NOT NULL DEFAULT 'pending', -- pending | review_required | reviewed | ignored
  related_artefact_id UUID REFERENCES public.artifacts(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.impact_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own impact items"
  ON public.impact_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.impact_runs ir WHERE ir.id = impact_items.impact_run_id AND ir.user_id = auth.uid()
  ));

-- Index for performance
CREATE INDEX idx_artefact_versions_artefact ON public.artefact_versions(artefact_id);
CREATE INDEX idx_change_sets_version ON public.change_sets(artefact_version_id);
CREATE INDEX idx_artefact_links_source ON public.artefact_links(source_id);
CREATE INDEX idx_artefact_links_target ON public.artefact_links(target_type, target_id);
CREATE INDEX idx_impact_runs_artefact ON public.impact_runs(artefact_id);
CREATE INDEX idx_impact_items_run ON public.impact_items(impact_run_id);
