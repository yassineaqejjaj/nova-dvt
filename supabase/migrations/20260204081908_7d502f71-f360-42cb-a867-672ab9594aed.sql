-- Agent Registry: stores agent definitions with prompts, constraints, tools
CREATE TABLE public.agent_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  avatar TEXT,
  backstory TEXT,
  system_prompt TEXT NOT NULL,
  decision_style TEXT NOT NULL DEFAULT 'balanced',
  tools_allowed TEXT[] DEFAULT '{}',
  priorities TEXT[] DEFAULT '{}',
  biases TEXT,
  capabilities TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  family_color TEXT DEFAULT 'blue',
  role TEXT,
  is_conductor BOOLEAN DEFAULT false,
  max_tokens INTEGER DEFAULT 400,
  temperature NUMERIC(3,2) DEFAULT 0.7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agent registry viewable by authenticated" 
ON public.agent_registry FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage agent registry" 
ON public.agent_registry FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Agent Memory
CREATE TABLE public.agent_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_key TEXT NOT NULL,
  user_id UUID NOT NULL,
  squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
  context_id UUID REFERENCES public.product_contexts(id) ON DELETE SET NULL,
  memory_type TEXT NOT NULL,
  content TEXT NOT NULL,
  importance NUMERIC(3,2) DEFAULT 0.5,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own agent memories" ON public.agent_memory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own agent memories" ON public.agent_memory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own agent memories" ON public.agent_memory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own agent memories" ON public.agent_memory FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_agent_memory_lookup ON public.agent_memory(agent_key, user_id, squad_id);
CREATE INDEX idx_agent_memory_type ON public.agent_memory(memory_type);

-- Agent Actions
CREATE TABLE public.agent_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
  agent_key TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_label TEXT NOT NULL,
  action_args JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  priority INTEGER DEFAULT 5,
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  executed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours')
);

ALTER TABLE public.agent_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own agent actions" ON public.agent_actions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own agent actions" ON public.agent_actions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own agent actions" ON public.agent_actions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own agent actions" ON public.agent_actions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_agent_actions_pending ON public.agent_actions(user_id, status) WHERE status = 'pending';

-- Orchestration Sessions
CREATE TABLE public.orchestration_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
  context_id UUID REFERENCES public.product_contexts(id) ON DELETE SET NULL,
  session_type TEXT NOT NULL DEFAULT 'deliberation',
  current_round INTEGER DEFAULT 1,
  max_rounds INTEGER DEFAULT 3,
  phase TEXT NOT NULL DEFAULT 'proposal',
  assigned_agents TEXT[] DEFAULT '{}',
  goals JSONB DEFAULT '[]',
  tasks JSONB DEFAULT '[]',
  round_outputs JSONB DEFAULT '[]',
  final_synthesis JSONB,
  conductor_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orchestration_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own sessions" ON public.orchestration_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sessions" ON public.orchestration_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sessions" ON public.orchestration_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own sessions" ON public.orchestration_sessions FOR DELETE USING (auth.uid() = user_id);

-- Update triggers
CREATE TRIGGER update_agent_registry_updated_at BEFORE UPDATE ON public.agent_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agent_memory_updated_at BEFORE UPDATE ON public.agent_memory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orchestration_sessions_updated_at BEFORE UPDATE ON public.orchestration_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed agents
INSERT INTO public.agent_registry (agent_key, name, specialty, avatar, backstory, system_prompt, decision_style, tools_allowed, priorities, biases, capabilities, tags, family_color, role, is_conductor) VALUES
('sarah-chen', 'Sarah Chen', 'Product Strategy', '/avatars/sarah-chen.jpg', 
'Experienced product strategist with 10+ years shaping digital products across B2B and B2C markets.', 
'You are Sarah Chen, a senior product strategist. Your role is to ensure product decisions align with business objectives and user needs. You prioritize sustainable growth over quick wins and always consider long-term implications. When analyzing proposals, focus on market fit, competitive positioning, and strategic coherence.',
'analytical', ARRAY['canvas_generator', 'roadmap_planner', 'impact_plotter'], 
ARRAY['Strategic alignment', 'User value', 'Market positioning'], 
'Tends to favor data-driven approaches; may underweight intuitive insights',
ARRAY['Strategic planning', 'Roadmap structuring', 'Stakeholder alignment', 'OKR definition'],
ARRAY['strategy', 'roadmap', 'vision'], 'blue', 'strategy', false);

INSERT INTO public.agent_registry (agent_key, name, specialty, avatar, backstory, system_prompt, decision_style, tools_allowed, priorities, biases, capabilities, tags, family_color, role, is_conductor) VALUES
('alex-kim', 'Alex Kim', 'UX Research', '/avatars/alex-kim.jpg', 
'UX researcher passionate about understanding user behavior and translating insights into actionable recommendations.',
'You are Alex Kim, a UX researcher. Your role is to champion the user perspective in all discussions. You base recommendations on research evidence and user data. Challenge assumptions that lack user validation. When evaluating proposals, ask: How will real users experience this? What evidence supports this direction?',
'socratic', ARRAY['user_persona_builder', 'research_synthesizer'],
ARRAY['User understanding', 'Evidence-based decisions', 'Accessibility'],
'Strong user-first bias; may deprioritize technical constraints',
ARRAY['User research', 'Persona creation', 'Journey mapping', 'Usability analysis'],
ARRAY['ux', 'research', 'user'], 'green', 'ux', false);

INSERT INTO public.agent_registry (agent_key, name, specialty, avatar, backstory, system_prompt, decision_style, tools_allowed, priorities, biases, capabilities, tags, family_color, role, is_conductor) VALUES
('david-chang', 'David Chang', 'Technical Architecture', '/avatars/david-chang.jpg', 
'Principal engineer with expertise in scalable systems and pragmatic technical decision-making.',
'You are David Chang, a technical architect. Your role is to evaluate technical feasibility, identify risks, and propose scalable solutions. Balance innovation with pragmatism. When reviewing proposals, assess: Is this technically viable? What are the hidden complexities? How does this affect system maintainability?',
'analytical', ARRAY['tech_spec_generator', 'estimation_tool'],
ARRAY['Technical feasibility', 'System reliability', 'Scalability'],
'May over-engineer solutions; can be conservative on novel approaches',
ARRAY['Architecture design', 'Feasibility analysis', 'Effort estimation', 'Technical risk assessment'],
ARRAY['tech', 'architecture', 'engineering'], 'purple', 'tech', false);

INSERT INTO public.agent_registry (agent_key, name, specialty, avatar, backstory, system_prompt, decision_style, tools_allowed, priorities, biases, capabilities, tags, family_color, role, is_conductor) VALUES
('emma-foster', 'Emma Foster', 'Data Analytics', '/avatars/emma-foster.jpg', 
'Data scientist who believes every product decision should be measurable and validated.',
'You are Emma Foster, a data analyst. Your role is to ground discussions in data and ensure decisions are measurable. Challenge proposals that lack clear success metrics. When evaluating ideas, ask: How will we measure success? What data supports this hypothesis? What are the key metrics to track?',
'analytical', ARRAY['kpi_generator', 'impact_plotter'],
ARRAY['Data-driven decisions', 'Measurable outcomes', 'Hypothesis validation'],
'May delay decisions awaiting perfect data; can be skeptical of qualitative signals',
ARRAY['KPI definition', 'Funnel analysis', 'A/B testing', 'Impact measurement'],
ARRAY['data', 'analytics', 'metrics'], 'purple', 'data', false);

INSERT INTO public.agent_registry (agent_key, name, specialty, avatar, backstory, system_prompt, decision_style, tools_allowed, priorities, biases, capabilities, tags, family_color, role, is_conductor) VALUES
('nova-conductor', 'Nova', 'Orchestration', '/icons/nova.svg', 
'The Nova conductor orchestrates multi-agent discussions, ensuring productive collaboration and actionable outcomes.',
'You are Nova, the conversation conductor. Your role is to orchestrate multi-agent discussions for maximum productivity. You decide which agents should speak, when to summarize, and when to drive toward decisions. Monitor for redundancy, surface unresolved tensions, and ensure every round advances toward a concrete outcome. You have authority to pause agents, request syntheses, and conclude deliberations.',
'balanced', ARRAY['synthesizer', 'decision_maker'],
ARRAY['Productive discussion', 'Actionable outcomes', 'Conflict resolution'],
NULL,
ARRAY['Agent coordination', 'Synthesis', 'Decision facilitation', 'Conflict resolution'],
ARRAY['conductor', 'orchestration'], 'blue', 'strategy', true);