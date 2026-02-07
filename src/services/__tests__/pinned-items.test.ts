import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabase, resetSupabaseMocks } from '@/test/mocks/supabase';
import { fetchPinnedItems, pinItem, unpinItem } from '../pinned-items';

beforeEach(() => {
  resetSupabaseMocks();
});

describe('fetchPinnedItems', () => {
  it('maps database fields to PinnedItemRecord format', async () => {
    const mockData = [
      {
        id: 'p1',
        item_type: 'agent',
        item_id: 'agent-1',
        item_data: { name: 'PM Agent' },
        position: 0,
      },
      {
        id: 'p2',
        item_type: 'workflow',
        item_id: 'wf-1',
        item_data: { name: 'Sprint Planning' },
        position: 1,
      },
    ];

    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: mockData, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const result = await fetchPinnedItems('user-123');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'p1',
      itemType: 'agent',
      itemId: 'agent-1',
      itemData: { name: 'PM Agent' },
      position: 0,
    });
    expect(result[1].itemType).toBe('workflow');
  });

  it('returns empty array for user with no pinned items', async () => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: [], error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const result = await fetchPinnedItems('user-123');
    expect(result).toEqual([]);
  });
});

describe('pinItem', () => {
  it('inserts with correct data', async () => {
    const insertFn = vi.fn().mockReturnThis();
    const builder = {
      insert: insertFn,
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    await pinItem('user-123', 'agent', 'agent-1', { name: 'Test Agent' }, 0);

    expect(mockSupabase.from).toHaveBeenCalledWith('pinned_items');
    expect(insertFn).toHaveBeenCalledWith({
      user_id: 'user-123',
      item_type: 'agent',
      item_id: 'agent-1',
      item_data: { name: 'Test Agent' },
      position: 0,
    });
  });
});

describe('unpinItem', () => {
  it('deletes the pinned item by id', async () => {
    const deleteFn = vi.fn().mockReturnThis();
    const eqFn = vi.fn().mockReturnThis();
    const builder = {
      delete: deleteFn,
      eq: eqFn,
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    await unpinItem('p1');

    expect(mockSupabase.from).toHaveBeenCalledWith('pinned_items');
    expect(deleteFn).toHaveBeenCalled();
    expect(eqFn).toHaveBeenCalledWith('id', 'p1');
  });
});
