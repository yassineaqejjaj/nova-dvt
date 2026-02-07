import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabase, resetSupabaseMocks } from '@/test/mocks/supabase';
import { fetchSession, upsertSession } from '../sessions';

beforeEach(() => {
  resetSupabaseMocks();
});

describe('fetchSession', () => {
  it('returns session data when found', async () => {
    const mockData = {
      last_workflow_type: 'feature_discovery',
      last_squad_id: 'sq1',
      last_context_id: 'ctx1',
      last_tab: 'chat',
      session_data: { key: 'value' },
    };

    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const result = await fetchSession('user-123');

    expect(result).toEqual({
      lastWorkflowType: 'feature_discovery',
      lastSquadId: 'sq1',
      lastContextId: 'ctx1',
      lastTab: 'chat',
      sessionData: { key: 'value' },
    });
  });

  it('returns null when no session exists (PGRST116)', async () => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      }),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const result = await fetchSession('user-123');
    expect(result).toBeNull();
  });

  it('throws on non-PGRST116 errors', async () => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: '500', message: 'Server error' },
      }),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    await expect(fetchSession('user-123')).rejects.toEqual({
      code: '500',
      message: 'Server error',
    });
  });
});

describe('upsertSession', () => {
  it('upserts with correct data', async () => {
    const upsertFn = vi.fn().mockReturnThis();
    const builder = {
      upsert: upsertFn,
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    await upsertSession('user-123', {
      lastTab: 'workflows',
      lastSquadId: 'sq2',
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('user_sessions');
    expect(upsertFn).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
        last_tab: 'workflows',
        last_squad_id: 'sq2',
      }),
      { onConflict: 'user_id' }
    );
  });
});
