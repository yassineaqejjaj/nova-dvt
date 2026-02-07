import { supabase } from '@/integrations/supabase/client';

export interface PinnedItemRecord {
  id: string;
  itemType: 'workflow' | 'agent' | 'squad' | 'artifact';
  itemId: string;
  itemData: Record<string, unknown>;
  position: number;
}

export async function fetchPinnedItems(userId: string): Promise<PinnedItemRecord[]> {
  const { data, error } = await supabase
    .from('pinned_items')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true });

  if (error) throw error;

  return (
    data?.map((d) => ({
      id: d.id,
      itemType: d.item_type as PinnedItemRecord['itemType'],
      itemId: d.item_id,
      itemData: d.item_data as Record<string, unknown>,
      position: d.position ?? 0,
    })) ?? []
  );
}

export async function pinItem(
  userId: string,
  itemType: PinnedItemRecord['itemType'],
  itemId: string,
  itemData: Record<string, unknown>,
  position: number
): Promise<void> {
  const { error } = await supabase.from('pinned_items').insert({
    user_id: userId,
    item_type: itemType,
    item_id: itemId,
    item_data: itemData as any,
    position,
  });

  if (error) throw error;
}

export async function unpinItem(itemId: string): Promise<void> {
  const { error } = await supabase.from('pinned_items').delete().eq('id', itemId);
  if (error) throw error;
}
