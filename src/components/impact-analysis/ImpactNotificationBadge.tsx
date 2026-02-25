import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ImpactNotificationBadgeProps {
  className?: string;
}

export const ImpactNotificationBadge: React.FC<ImpactNotificationBadgeProps> = ({ className }) => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    loadUnreviewed();

    // Realtime: listen for new completed impact_queue entries
    const channel = supabase
      .channel('impact-notifications')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'impact_queue',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.new && (payload.new as any).status === 'completed' && (payload.new as any).impact_run_id) {
          loadUnreviewed();
          toast.info('Nova a détecté de nouveaux impacts', {
            description: 'Une analyse automatique vient de se terminer.',
            action: { label: 'Voir', onClick: () => {} },
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const loadUnreviewed = async () => {
    if (!user?.id) return;
    // Count impact items with pending review from recent runs
    const { count: pendingCount } = await supabase
      .from('impact_items')
      .select('id', { count: 'exact', head: true })
      .eq('review_status', 'pending')
      .limit(100);

    setCount(pendingCount || 0);
  };

  if (count === 0) return null;

  return (
    <Badge 
      variant="destructive" 
      className={`text-[10px] px-1.5 py-0 h-4 min-w-[16px] flex items-center justify-center ${className}`}
    >
      {count > 99 ? '99+' : count}
    </Badge>
  );
};
