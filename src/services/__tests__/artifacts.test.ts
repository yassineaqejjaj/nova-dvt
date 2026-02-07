import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabase, resetSupabaseMocks } from '@/test/mocks/supabase';
import {
  fetchArtifacts,
  fetchArtifactById,
  createArtifact,
  deleteArtifact,
  countUserArtifacts,
} from '../artifacts';

beforeEach(() => {
  resetSupabaseMocks();
});

describe('fetchArtifacts', () => {
  it('returns mapped artifacts for a user', async () => {
    const mockData = [
      {
        id: 'a1',
        user_id: 'user-123',
        squad_id: 'sq1',
        artifact_type: 'prd',
        title: 'My PRD',
        content: { text: 'content' },
        metadata: { source: 'instant' },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
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

    const result = await fetchArtifacts('user-123');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'a1',
      user_id: 'user-123',
      squad_id: 'sq1',
      artifact_type: 'prd',
      title: 'My PRD',
      content: { text: 'content' },
      metadata: { source: 'instant' },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    });
  });

  it('returns empty array when user has no artifacts', async () => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: [], error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const result = await fetchArtifacts('user-123');
    expect(result).toEqual([]);
  });

  it('throws on database error', async () => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
        Promise.resolve({ data: null, error: { message: 'DB error' } }).then((r) => {
          if (r.error) throw r.error;
          return resolve(r);
        }),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    // The service checks the error and throws
    // We need to mock differently — make the awaited result include the error
    const builder2 = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: { message: 'DB error' } }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder2 as any);

    await expect(fetchArtifacts('user-123')).rejects.toEqual({ message: 'DB error' });
  });
});

describe('fetchArtifactById', () => {
  it('returns null when artifact not found (PGRST116)', async () => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      }),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const result = await fetchArtifactById('nonexistent');
    expect(result).toBeNull();
  });

  it('returns the artifact when found', async () => {
    const mockArtifact = {
      id: 'a1',
      user_id: 'user-123',
      squad_id: null,
      artifact_type: 'story',
      title: 'A Story',
      content: { text: 'story content' },
      metadata: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockArtifact, error: null }),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const result = await fetchArtifactById('a1');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('a1');
    expect(result!.squad_id).toBeUndefined();
  });
});

describe('createArtifact', () => {
  it('inserts and returns the created artifact', async () => {
    const returnData = {
      id: 'new-1',
      user_id: 'user-123',
      squad_id: null,
      artifact_type: 'prd',
      title: 'New PRD',
      content: { sections: [] },
      metadata: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const builder = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: returnData, error: null }),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const result = await createArtifact({
      user_id: 'user-123',
      artifact_type: 'prd',
      title: 'New PRD',
      content: { sections: [] },
    });

    expect(result.id).toBe('new-1');
    expect(result.title).toBe('New PRD');
  });
});

describe('deleteArtifact', () => {
  it('calls delete on the correct artifact', async () => {
    const deleteFn = vi.fn().mockReturnThis();
    const eqFn = vi.fn().mockReturnThis();
    const builder = {
      delete: deleteFn,
      eq: eqFn,
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    await deleteArtifact('a1');

    expect(mockSupabase.from).toHaveBeenCalledWith('artifacts');
    expect(deleteFn).toHaveBeenCalled();
    expect(eqFn).toHaveBeenCalledWith('id', 'a1');
  });
});

describe('countUserArtifacts', () => {
  it('returns the count', async () => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ count: 42, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const result = await countUserArtifacts('user-123');
    expect(result).toBe(42);
  });

  it('returns 0 when count is null', async () => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ count: null, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const result = await countUserArtifacts('user-123');
    expect(result).toBe(0);
  });
});
