-- User Sessions Table - Track last activity for "Continue where you left off"
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  last_workflow_type TEXT,
  last_squad_id UUID,
  last_context_id UUID,
  last_tab TEXT,
  session_data JSONB DEFAULT '{}'::jsonb,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pinned Items Table - For dashboard quick deck
CREATE TABLE IF NOT EXISTS public.pinned_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL, -- 'workflow', 'agent', 'squad', 'artifact'
  item_id TEXT NOT NULL,
  item_data JSONB DEFAULT '{}'::jsonb,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insights Table - Cached AI-powered insights
CREATE TABLE IF NOT EXISTS public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL, -- 'diversity', 'efficiency', 'trend'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Shareable Moments Table - Track milestone cards
CREATE TABLE IF NOT EXISTS public.shareable_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  moment_type TEXT NOT NULL, -- 'level_up', 'agent_unlock', 'workflow_complete'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  share_data JSONB DEFAULT '{}'::jsonb,
  shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent Personalities Table - Customizable agent traits
CREATE TABLE IF NOT EXISTS public.agent_personalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  personality_type TEXT NOT NULL DEFAULT 'balanced', -- 'serious', 'playful', 'socratic', 'analytical'
  custom_traits JSONB DEFAULT '{}'::jsonb,
  visual_style JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, agent_id)
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinned_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shareable_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_personalities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sessions"
  ON public.user_sessions FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for pinned_items
CREATE POLICY "Users can view their own pinned items"
  ON public.pinned_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own pinned items"
  ON public.pinned_items FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for insights
CREATE POLICY "Users can view their own insights"
  ON public.insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own insights"
  ON public.insights FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for shareable_moments
CREATE POLICY "Users can view their own moments"
  ON public.shareable_moments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own moments"
  ON public.shareable_moments FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for agent_personalities
CREATE POLICY "Users can view their own agent personalities"
  ON public.agent_personalities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own agent personalities"
  ON public.agent_personalities FOR ALL
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_last_active ON public.user_sessions(user_id, last_active_at DESC);
CREATE INDEX idx_pinned_items_user_id ON public.pinned_items(user_id, position);
CREATE INDEX idx_insights_user_id ON public.insights(user_id, created_at DESC);
CREATE INDEX idx_insights_expires ON public.insights(expires_at) WHERE dismissed = FALSE;
CREATE INDEX idx_shareable_moments_user_id ON public.shareable_moments(user_id, created_at DESC);
CREATE INDEX idx_agent_personalities_lookup ON public.agent_personalities(user_id, agent_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON public.user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_personalities_updated_at
  BEFORE UPDATE ON public.agent_personalities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();