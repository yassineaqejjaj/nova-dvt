-- Decision Log table for organizational memory
CREATE TABLE public.decision_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  squad_id UUID REFERENCES public.squads(id),
  debate_topic TEXT NOT NULL,
  context TEXT,
  options_considered JSONB NOT NULL DEFAULT '[]',
  option_chosen JSONB,
  assumptions JSONB DEFAULT '[]',
  kpis_to_watch JSONB DEFAULT '[]',
  confidence_level TEXT CHECK (confidence_level IN ('high', 'medium', 'low')),
  confidence_factors JSONB DEFAULT '{}',
  counterfactual_analysis JSONB,
  debate_messages JSONB DEFAULT '[]',
  outcome JSONB,
  tensions_remaining JSONB DEFAULT '[]',
  non_negotiables JSONB DEFAULT '[]',
  consensus_points JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agent analytics for signal-to-noise scoring
CREATE TABLE public.agent_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  decision_id UUID REFERENCES public.decision_log(id) ON DELETE CASCADE,
  contributions_count INTEGER DEFAULT 0,
  survived_synthesis INTEGER DEFAULT 0,
  influenced_decision INTEGER DEFAULT 0,
  ignored_count INTEGER DEFAULT 0,
  word_count_avg INTEGER DEFAULT 0,
  stance_consistency DECIMAL(3,2) DEFAULT 0,
  signal_score DECIMAL(3,2) DEFAULT 0,
  strengths JSONB DEFAULT '[]',
  weaknesses JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Real-world validation links
CREATE TABLE public.decision_validations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  decision_id UUID REFERENCES public.decision_log(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  validation_type TEXT CHECK (validation_type IN ('store_feedback', 'advisor_quote', 'kpi_snapshot', 'pilot_result', 'other')),
  title TEXT NOT NULL,
  content TEXT,
  attachment_url TEXT,
  validates_assumption TEXT,
  assumption_status TEXT CHECK (assumption_status IN ('validated', 'invalidated', 'partial', 'pending')),
  confidence_impact TEXT CHECK (confidence_impact IN ('increases', 'decreases', 'neutral')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User thinking style analytics (opt-in)
CREATE TABLE public.user_thinking_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  opt_in BOOLEAN DEFAULT false,
  debates_participated INTEGER DEFAULT 0,
  early_agreement_rate DECIMAL(3,2) DEFAULT 0,
  risk_raising_rate DECIMAL(3,2) DEFAULT 0,
  alternative_proposal_rate DECIMAL(3,2) DEFAULT 0,
  synthesis_contribution_rate DECIMAL(3,2) DEFAULT 0,
  ideation_contribution_rate DECIMAL(3,2) DEFAULT 0,
  strongest_impact_area TEXT,
  insights JSONB DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Friction heatmap tracking
CREATE TABLE public.friction_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tension_signature TEXT NOT NULL,
  tension_left TEXT NOT NULL,
  tension_right TEXT NOT NULL,
  occurrence_count INTEGER DEFAULT 1,
  decision_ids JSONB DEFAULT '[]',
  last_occurred TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolution_rate DECIMAL(3,2) DEFAULT 0,
  is_structural BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.decision_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_thinking_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friction_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for decision_log
CREATE POLICY "Users can view their own decisions" ON public.decision_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create decisions" ON public.decision_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own decisions" ON public.decision_log FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for agent_analytics
CREATE POLICY "Users can view agent analytics for their decisions" ON public.agent_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.decision_log WHERE id = decision_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create agent analytics" ON public.agent_analytics FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.decision_log WHERE id = decision_id AND user_id = auth.uid())
);

-- RLS Policies for decision_validations
CREATE POLICY "Users can view their validations" ON public.decision_validations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create validations" ON public.decision_validations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their validations" ON public.decision_validations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their validations" ON public.decision_validations FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_thinking_analytics
CREATE POLICY "Users can view their own analytics" ON public.user_thinking_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert their analytics" ON public.user_thinking_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their analytics" ON public.user_thinking_analytics FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for friction_patterns (viewable by all authenticated users)
CREATE POLICY "Authenticated users can view friction patterns" ON public.friction_patterns FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can create friction patterns" ON public.friction_patterns FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update friction patterns" ON public.friction_patterns FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_decision_log_updated_at
  BEFORE UPDATE ON public.decision_log
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_thinking_analytics_updated_at
  BEFORE UPDATE ON public.user_thinking_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();