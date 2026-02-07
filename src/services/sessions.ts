import { supabase } from '@/integrations/supabase/client';
import type { TabType } from '@/types';

export interface SessionData {
  lastWorkflowType?: string;
  lastSquadId?: string;
  lastContextId?: string;
  lastTab?: TabType;
  sessionData?: Record<string, unknown>;
}

export async function fetchSession(userId: string): Promise<SessionData | null> {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('last_active_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    lastWorkflowType: data.last_workflow_type ?? undefined,
    lastSquadId: data.last_squad_id ?? undefined,
    lastContextId: data.last_context_id ?? undefined,
    lastTab: (data.last_tab as TabType) ?? undefined,
    sessionData: (data.session_data as Record<string, unknown>) ?? undefined,
  };
}

export async function upsertSession(userId: string, updates: Partial<SessionData>): Promise<void> {
  const { error } = await supabase.from('user_sessions').upsert(
    {
      user_id: userId,
      last_workflow_type: updates.lastWorkflowType,
      last_squad_id: updates.lastSquadId,
      last_context_id: updates.lastContextId,
      last_tab: updates.lastTab,
      session_data: (updates.sessionData || {}) as any,
      last_active_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) throw error;
}
