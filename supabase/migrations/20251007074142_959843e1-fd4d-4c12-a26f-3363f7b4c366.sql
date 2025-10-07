-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create enum for feature flag status
CREATE TYPE public.feature_status AS ENUM ('enabled', 'disabled', 'beta');

-- Create user_roles table with security definer function to prevent RLS recursion
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create feature_flags table
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name TEXT NOT NULL UNIQUE,
  status feature_status NOT NULL DEFAULT 'disabled',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for feature_flags
CREATE POLICY "Everyone can view feature flags"
  ON public.feature_flags FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage feature flags"
  ON public.feature_flags FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for feature_flags updated_at
CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_feature_flags_name ON public.feature_flags(feature_name);
CREATE INDEX idx_feature_flags_status ON public.feature_flags(status);

-- Insert default feature flags
INSERT INTO public.feature_flags (feature_name, status, description) VALUES
  ('workflows', 'enabled', 'PM Workflows feature'),
  ('artifacts', 'enabled', 'Artifacts dashboard'),
  ('workspaces', 'enabled', 'Team workspaces'),
  ('integrations', 'enabled', 'External integrations'),
  ('analytics', 'enabled', 'Analytics dashboard'),
  ('market_research', 'enabled', 'Market research tool');