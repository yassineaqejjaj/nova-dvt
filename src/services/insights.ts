import { supabase } from '@/integrations/supabase/client';

export interface InsightRecord {
  id: string;
  insightType: string;
  title: string;
  description: string;
  data?: Record<string, unknown>;
  dismissed: boolean;
  createdAt: string;
}

export async function fetchInsights(userId: string): Promise<InsightRecord[]> {
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('user_id', userId)
    .eq('dismissed', false)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) throw error;

  return (
    data?.map((d) => ({
      id: d.id,
      insightType: d.insight_type,
      title: d.title,
      description: d.description,
      data: d.data as Record<string, unknown> | undefined,
      dismissed: d.dismissed ?? false,
      createdAt: d.created_at ?? '',
    })) ?? []
  );
}

export async function dismissInsight(insightId: string): Promise<void> {
  const { error } = await supabase.from('insights').update({ dismissed: true }).eq('id', insightId);

  if (error) throw error;
}

export async function generateInsights(userId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('generate-insights', {
    body: { userId },
  });

  if (error) throw error;
}
