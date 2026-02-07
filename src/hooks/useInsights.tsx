import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Insight {
  id: string;
  insightType: string;
  title: string;
  description: string;
  data?: any;
  dismissed: boolean;
  createdAt: string;
}

export function useInsights(userId: string | undefined) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadInsights();
  }, [userId]);

  const loadInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', userId!)
        .eq('dismissed', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setInsights(
        data?.map((d) => ({
          id: d.id,
          insightType: d.insight_type,
          title: d.title,
          description: d.description,
          data: d.data,
          dismissed: d.dismissed ?? false,
          createdAt: d.created_at,
        })) || []
      );
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissInsight = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('insights')
        .update({ dismissed: true })
        .eq('id', insightId);

      if (error) throw error;
      setInsights((prev) => prev.filter((i) => i.id !== insightId));
    } catch (error) {
      console.error('Error dismissing insight:', error);
    }
  };

  const generateInsights = async () => {
    try {
      // Call edge function to generate AI-powered insights
      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: { userId },
      });

      if (error) throw error;
      await loadInsights();
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  return { insights, loading, dismissInsight, generateInsights };
}
