import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabase, resetSupabaseMocks } from '@/test/mocks/supabase';
import { fetchInsights, dismissInsight, generateInsights } from '../insights';

beforeEach(() => {
  resetSupabaseMocks();
});

describe('fetchInsights', () => {
  it('maps database fields to InsightRecord format', async () => {
    const mockData = [
      {
        id: 'i1',
        insight_type: 'suggestion',
        title: 'Try workflows',
        description: 'You have not tried workflows yet',
        data: { category: 'onboarding' },
        dismissed: false,
        created_at: '2024-01-01T00:00:00Z',
      },
    ];

    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: mockData, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const result = await fetchInsights('user-123');

    expect(result).toEqual([
      {
        id: 'i1',
        insightType: 'suggestion',
        title: 'Try workflows',
        description: 'You have not tried workflows yet',
        data: { category: 'onboarding' },
        dismissed: false,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ]);
  });

  it('returns empty array when no insights', async () => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: [], error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const result = await fetchInsights('user-123');
    expect(result).toEqual([]);
  });
});

describe('dismissInsight', () => {
  it('updates the insight to dismissed', async () => {
    const updateFn = vi.fn().mockReturnThis();
    const eqFn = vi.fn().mockReturnThis();
    const builder = {
      update: updateFn,
      eq: eqFn,
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    await dismissInsight('i1');

    expect(mockSupabase.from).toHaveBeenCalledWith('insights');
    expect(updateFn).toHaveBeenCalledWith({ dismissed: true });
    expect(eqFn).toHaveBeenCalledWith('id', 'i1');
  });
});

describe('generateInsights', () => {
  it('invokes the generate-insights edge function', async () => {
    await generateInsights('user-123');

    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('generate-insights', {
      body: { userId: 'user-123' },
    });
  });
});
