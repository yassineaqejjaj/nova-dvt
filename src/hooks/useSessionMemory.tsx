import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TabType } from '@/types';

export interface SessionData {
  lastWorkflowType?: string;
  lastSquadId?: string;
  lastContextId?: string;
  lastTab?: TabType;
  sessionData?: any;
}

export function useSessionMemory(userId: string | undefined) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadSession();
  }, [userId]);

  const loadSession = async () => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_active_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSession({
          lastWorkflowType: data.last_workflow_type,
          lastSquadId: data.last_squad_id,
          lastContextId: data.last_context_id,
          lastTab: data.last_tab as TabType,
          sessionData: data.session_data,
        });
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSession = async (updates: Partial<SessionData>) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('user_sessions')
        .upsert({
          user_id: userId,
          last_workflow_type: updates.lastWorkflowType,
          last_squad_id: updates.lastSquadId,
          last_context_id: updates.lastContextId,
          last_tab: updates.lastTab,
          session_data: updates.sessionData || {},
          last_active_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;
      setSession(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  return { session, loading, updateSession };
}
