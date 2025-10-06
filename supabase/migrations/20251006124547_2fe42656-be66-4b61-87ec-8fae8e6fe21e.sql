-- Create enum for artifact types
CREATE TYPE public.artifact_type AS ENUM ('canvas', 'story', 'impact_analysis');

-- Create enum for integration types
CREATE TYPE public.integration_type AS ENUM ('jira', 'slack', 'figma');

-- Create artifacts table for storing generated content
CREATE TABLE public.artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
  artifact_type artifact_type NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workspaces table for team collaboration
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workspace members table
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create integrations table
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  integration_type integration_type NOT NULL,
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create analytics events table
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add workspace_id to squads table
ALTER TABLE public.squads ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;

-- Add artifact_references to chat_messages
ALTER TABLE public.chat_messages ADD COLUMN artifact_references UUID[] DEFAULT ARRAY[]::UUID[];

-- Enable RLS on all new tables
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for artifacts
CREATE POLICY "Users can view their own artifacts"
  ON public.artifacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own artifacts"
  ON public.artifacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own artifacts"
  ON public.artifacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own artifacts"
  ON public.artifacts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for workspaces
CREATE POLICY "Users can view workspaces they own or are members of"
  ON public.workspaces FOR SELECT
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspaces.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own workspaces"
  ON public.workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Workspace owners can update their workspaces"
  ON public.workspaces FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Workspace owners can delete their workspaces"
  ON public.workspaces FOR DELETE
  USING (auth.uid() = owner_id);

-- RLS Policies for workspace_members
CREATE POLICY "Users can view members of their workspaces"
  ON public.workspace_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_id AND (owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.workspace_members wm WHERE wm.workspace_id = id AND wm.user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Workspace owners can manage members"
  ON public.workspace_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_id AND owner_id = auth.uid()
    )
  );

-- RLS Policies for integrations
CREATE POLICY "Workspace members can view integrations"
  ON public.integrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Workspace owners can manage integrations"
  ON public.integrations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_id AND owner_id = auth.uid()
    )
  );

-- RLS Policies for analytics_events
CREATE POLICY "Users can view their own analytics"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_artifacts_updated_at
  BEFORE UPDATE ON public.artifacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_artifacts_user_id ON public.artifacts(user_id);
CREATE INDEX idx_artifacts_squad_id ON public.artifacts(squad_id);
CREATE INDEX idx_artifacts_type ON public.artifacts(artifact_type);
CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);