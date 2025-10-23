-- Nova Conversations Table for persistent chat history
CREATE TABLE public.nova_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  context_snapshot JSONB,
  workflow_state JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Nova Feedback Table
CREATE TABLE public.nova_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.nova_conversations(id) ON DELETE CASCADE,
  message_index INTEGER NOT NULL,
  rating INTEGER CHECK (rating IN (-1, 1)),
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Shared Conversations for collaboration
CREATE TABLE public.nova_shared_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.nova_conversations(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit')),
  shared_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(conversation_id, shared_with_user_id)
);

-- Enable RLS
ALTER TABLE public.nova_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nova_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nova_shared_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nova_conversations
CREATE POLICY "Users can manage their own conversations"
  ON public.nova_conversations FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared conversations"
  ON public.nova_conversations FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.nova_shared_conversations
      WHERE conversation_id = nova_conversations.id
      AND shared_with_user_id = auth.uid()
    )
  );

-- RLS Policies for nova_feedback
CREATE POLICY "Users can manage feedback on their conversations"
  ON public.nova_feedback FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.nova_conversations
      WHERE id = nova_feedback.conversation_id
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for nova_shared_conversations
CREATE POLICY "Users can view their shared conversations"
  ON public.nova_shared_conversations FOR SELECT
  USING (
    auth.uid() = shared_with_user_id OR
    auth.uid() = shared_by_user_id OR
    EXISTS (
      SELECT 1 FROM public.nova_conversations
      WHERE id = nova_shared_conversations.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Conversation owners can share"
  ON public.nova_shared_conversations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.nova_conversations
      WHERE id = conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Conversation owners can manage shares"
  ON public.nova_shared_conversations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.nova_conversations
      WHERE id = conversation_id
      AND user_id = auth.uid()
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_nova_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_nova_conversations_updated_at
  BEFORE UPDATE ON public.nova_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_nova_conversation_updated_at();

-- Indexes for performance
CREATE INDEX idx_nova_conversations_user_id ON public.nova_conversations(user_id);
CREATE INDEX idx_nova_conversations_is_active ON public.nova_conversations(is_active);
CREATE INDEX idx_nova_shared_conversations_conversation_id ON public.nova_shared_conversations(conversation_id);
CREATE INDEX idx_nova_shared_conversations_shared_with ON public.nova_shared_conversations(shared_with_user_id);