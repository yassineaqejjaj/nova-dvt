-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create squads table
CREATE TABLE public.squads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  purpose TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create squad_agents table (many-to-many relationship)
CREATE TABLE public.squad_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  agent_specialty TEXT NOT NULL,
  agent_avatar TEXT,
  agent_backstory TEXT,
  agent_capabilities TEXT[], -- Array of capabilities
  agent_tags TEXT[], -- Array of tags
  agent_xp_required INTEGER NOT NULL DEFAULT 0,
  agent_family_color TEXT NOT NULL DEFAULT 'blue',
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unlocked_agents table
CREATE TABLE public.unlocked_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'agent')),
  sender_agent_id TEXT, -- null if sender_type is 'user'
  sender_agent_name TEXT, -- null if sender_type is 'user'
  mentioned_agents TEXT[], -- Array of mentioned agent IDs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unlocked_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for squads
CREATE POLICY "Users can view their own squads" 
ON public.squads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own squads" 
ON public.squads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own squads" 
ON public.squads 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own squads" 
ON public.squads 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for squad_agents
CREATE POLICY "Users can view agents in their own squads" 
ON public.squad_agents 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.squads 
  WHERE squads.id = squad_agents.squad_id 
  AND squads.user_id = auth.uid()
));

CREATE POLICY "Users can add agents to their own squads" 
ON public.squad_agents 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.squads 
  WHERE squads.id = squad_agents.squad_id 
  AND squads.user_id = auth.uid()
));

CREATE POLICY "Users can update agents in their own squads" 
ON public.squad_agents 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.squads 
  WHERE squads.id = squad_agents.squad_id 
  AND squads.user_id = auth.uid()
));

CREATE POLICY "Users can remove agents from their own squads" 
ON public.squad_agents 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.squads 
  WHERE squads.id = squad_agents.squad_id 
  AND squads.user_id = auth.uid()
));

-- Create policies for user_badges
CREATE POLICY "Users can view their own badges" 
ON public.user_badges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own badges" 
ON public.user_badges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for unlocked_agents
CREATE POLICY "Users can view their own unlocked agents" 
ON public.unlocked_agents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock agents for themselves" 
ON public.unlocked_agents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for chat_messages
CREATE POLICY "Users can view messages in their own squads" 
ON public.chat_messages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create messages in their own squads" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.squads 
  WHERE squads.id = chat_messages.squad_id 
  AND squads.user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_squads_updated_at
BEFORE UPDATE ON public.squads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Anonymous User'),
    'Team Member'
  );
  
  -- Add first badge
  INSERT INTO public.user_badges (user_id, badge_id, badge_name, badge_description, badge_icon)
  VALUES (
    NEW.id,
    'welcome',
    'Welcome Aboard',
    'Joined Squad Mate',
    '🎉'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to handle new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();