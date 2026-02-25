
-- Phase 4: impact_queue + link_suggestions tables + auto-trigger

-- Table: impact_queue
CREATE TABLE public.impact_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artefact_id UUID NOT NULL REFERENCES public.artifacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  impact_run_id UUID REFERENCES public.impact_runs(id),
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 seconds'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.impact_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own impact queue"
  ON public.impact_queue FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_impact_queue_status ON public.impact_queue (status, scheduled_at);
CREATE INDEX idx_impact_queue_artefact ON public.impact_queue (artefact_id);

-- Table: link_suggestions
CREATE TABLE public.link_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artefact_id UUID NOT NULL REFERENCES public.artifacts(id) ON DELETE CASCADE,
  suggested_target_type TEXT NOT NULL,
  suggested_target_id TEXT NOT NULL,
  suggested_link_type TEXT NOT NULL DEFAULT 'depends_on',
  confidence NUMERIC NOT NULL DEFAULT 0.5,
  reasoning TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.link_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own link suggestions"
  ON public.link_suggestions FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_link_suggestions_artefact ON public.link_suggestions (artefact_id, status);

-- Trigger: auto-enqueue impact analysis on artifact content update
CREATE OR REPLACE FUNCTION public.enqueue_impact_on_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_pending UUID;
BEGIN
  -- Only trigger if content actually changed
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    -- Check for existing pending entry for same artefact (debounce)
    SELECT id INTO existing_pending
    FROM public.impact_queue
    WHERE artefact_id = NEW.id
      AND status = 'pending'
      AND scheduled_at > now()
    LIMIT 1;

    IF existing_pending IS NOT NULL THEN
      -- Reset the scheduled_at to debounce (push forward 30s)
      UPDATE public.impact_queue
      SET scheduled_at = now() + interval '30 seconds'
      WHERE id = existing_pending;
    ELSE
      INSERT INTO public.impact_queue (artefact_id, user_id, status, scheduled_at)
      VALUES (NEW.id, NEW.user_id, 'pending', now() + interval '30 seconds');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enqueue_impact_on_artifact_update
  AFTER UPDATE ON public.artifacts
  FOR EACH ROW
  EXECUTE FUNCTION public.enqueue_impact_on_update();
