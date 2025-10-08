-- Fix RLS recursion bug in workspaces table
-- Drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Users can view workspaces they own or are members of" ON public.workspaces;

-- Create a simpler, non-recursive policy
CREATE POLICY "Users can view workspaces they own"
  ON public.workspaces FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can view workspaces they are members of"
  ON public.workspaces FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
        AND workspace_members.user_id = auth.uid()
    )
  );

-- Also fix the workspace_members policy to avoid recursion
DROP POLICY IF EXISTS "Users can view members of their workspaces" ON public.workspace_members;

CREATE POLICY "Workspace owners can view members"
  ON public.workspace_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM workspaces
      WHERE workspaces.id = workspace_members.workspace_id
        AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can view members"
  ON public.workspace_members FOR SELECT
  USING (
    workspace_members.user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
        AND wm.user_id = auth.uid()
    )
  );

-- Update squads table to support workspace collaboration
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;