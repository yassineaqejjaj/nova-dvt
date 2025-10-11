import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PinnedItem {
  id: string;
  itemType: 'workflow' | 'agent' | 'squad' | 'artifact';
  itemId: string;
  itemData: any;
  position: number;
}

export function usePinnedItems(userId: string | undefined) {
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadPinnedItems();
  }, [userId]);

  const loadPinnedItems = async () => {
    try {
      const { data, error } = await supabase
        .from('pinned_items')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true });

      if (error) throw error;

      setPinnedItems(
        data?.map(d => ({
          id: d.id,
          itemType: d.item_type as any,
          itemId: d.item_id,
          itemData: d.item_data,
          position: d.position,
        })) || []
      );
    } catch (error) {
      console.error('Error loading pinned items:', error);
    } finally {
      setLoading(false);
    }
  };

  const pinItem = async (
    itemType: PinnedItem['itemType'],
    itemId: string,
    itemData: any
  ) => {
    if (!userId) return;

    try {
      const position = pinnedItems.length;
      const { error } = await supabase.from('pinned_items').insert({
        user_id: userId,
        item_type: itemType,
        item_id: itemId,
        item_data: itemData,
        position,
      });

      if (error) throw error;
      await loadPinnedItems();
    } catch (error) {
      console.error('Error pinning item:', error);
    }
  };

  const unpinItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pinned_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPinnedItems(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error('Error unpinning item:', error);
    }
  };

  return { pinnedItems, loading, pinItem, unpinItem };
}
