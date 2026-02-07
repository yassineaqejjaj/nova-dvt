import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabase, resetSupabaseMocks } from '@/test/mocks/supabase';
import {
  calculateLevel,
  generateBoxRewards,
  fetchOrCreateGamification,
  fetchDailyMissions,
  fetchBadges,
  fetchMysteryBoxes,
  completeMission,
  addRewards,
  buyStreakFreeze,
  ensureDailyMissions,
} from '../gamification';

beforeEach(() => {
  resetSupabaseMocks();
});

// ─── Pure functions ───────────────────────────────────────

describe('calculateLevel', () => {
  it('returns 1 for 0 XP', () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it('returns 1 for XP below first threshold', () => {
    expect(calculateLevel(199)).toBe(1);
  });

  it('returns 2 at exactly 200 XP', () => {
    expect(calculateLevel(200)).toBe(2);
  });

  it('returns 3 at exactly 500 XP', () => {
    expect(calculateLevel(500)).toBe(3);
  });

  it('returns max level for very high XP', () => {
    expect(calculateLevel(100000)).toBe(16);
  });

  it('returns correct mid-range level', () => {
    expect(calculateLevel(3500)).toBe(6);
  });
});

describe('generateBoxRewards', () => {
  it('returns an object with rarity, xp, and coins', () => {
    const result = generateBoxRewards('standard');
    expect(result).toHaveProperty('rarity');
    expect(result).toHaveProperty('xp');
    expect(result).toHaveProperty('coins');
    expect(typeof result.xp).toBe('number');
    expect(typeof result.coins).toBe('number');
  });

  it('returns only valid rarities', () => {
    // Run many times to exercise different random paths
    const rarities = new Set<string>();
    for (let i = 0; i < 200; i++) {
      rarities.add(generateBoxRewards('standard').rarity);
    }
    for (const r of rarities) {
      expect(['common', 'rare', 'epic', 'legendary']).toContain(r);
    }
  });
});

// ─── Service functions (with mocked Supabase) ────────────

describe('fetchOrCreateGamification', () => {
  it('returns existing record when found', async () => {
    const mockData = {
      level: 5,
      xp: 1200,
      coins: 300,
      current_streak: 3,
      longest_streak: 7,
      streak_freezes_available: 1,
    };

    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const result = await fetchOrCreateGamification('user-123');

    expect(result).toEqual({
      level: 5,
      xp: 1200,
      coins: 300,
      currentStreak: 3,
      longestStreak: 7,
      streakFreezesAvailable: 1,
    });
  });

  it('creates a new record when none exists', async () => {
    const newRecord = {
      level: 1,
      xp: 0,
      coins: 0,
      current_streak: 0,
      longest_streak: 0,
      streak_freezes_available: 0,
    };

    // First call: maybeSingle returns null (no record)
    const selectBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    // Second call: insert returns new record
    const insertBuilder = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: newRecord, error: null }),
    };

    let callCount = 0;
    mockSupabase.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return selectBuilder as any;
      return insertBuilder as any;
    });

    const result = await fetchOrCreateGamification('user-123');

    expect(result).toEqual({
      level: 1,
      xp: 0,
      coins: 0,
      currentStreak: 0,
      longestStreak: 0,
      streakFreezesAvailable: 0,
    });
  });

  it('throws when supabase returns an error', async () => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'DB error', code: '500' },
      }),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    await expect(fetchOrCreateGamification('user-123')).rejects.toEqual({
      message: 'DB error',
      code: '500',
    });
  });
});

describe('fetchDailyMissions', () => {
  it('maps database fields to DailyMissionRecord format', async () => {
    const mockMissions = [
      {
        id: 'm1',
        title: 'Test Mission',
        description: 'Do something',
        xp_reward: 50,
        coins_reward: 10,
        difficulty: 'easy',
        estimated_time: '2 min',
        completed: false,
        mission_type: 'create_prd',
      },
    ];

    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      // Return a thenable
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: mockMissions, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const result = await fetchDailyMissions('user-123');

    expect(result).toEqual([
      {
        id: 'm1',
        title: 'Test Mission',
        description: 'Do something',
        xpReward: 50,
        coinsReward: 10,
        difficulty: 'easy',
        estimatedTime: '2 min',
        completed: false,
        missionType: 'create_prd',
      },
    ]);
  });

  it('returns empty array when no missions exist', async () => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: [], error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const result = await fetchDailyMissions('user-123');
    expect(result).toEqual([]);
  });
});

describe('fetchBadges', () => {
  it('maps database fields correctly', async () => {
    const mockBadges = [
      {
        id: 'b1',
        badge_id: 'first_prd',
        badge_name: 'First PRD',
        badge_description: 'Created first PRD',
        badge_icon: '📝',
        rarity: 'common',
        badge_category: 'creation',
        unlocked_at: '2024-01-01T00:00:00Z',
      },
    ];

    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: mockBadges, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const result = await fetchBadges('user-123');

    expect(result[0].badgeId).toBe('first_prd');
    expect(result[0].badgeName).toBe('First PRD');
    expect(result[0].rarity).toBe('common');
  });
});

describe('fetchMysteryBoxes', () => {
  it('maps database fields correctly', async () => {
    const mockBoxes = [
      {
        id: 'box1',
        box_type: 'standard',
        opened: false,
        rewards: null,
        expires_at: null,
      },
    ];

    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: mockBoxes, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const result = await fetchMysteryBoxes('user-123');
    expect(result).toEqual([
      { id: 'box1', boxType: 'standard', opened: false, rewards: null, expiresAt: null },
    ]);
  });
});

describe('completeMission', () => {
  it('calls update with correct params', async () => {
    const updateFn = vi.fn().mockReturnThis();
    const eqFn = vi.fn().mockReturnThis();
    const builder = {
      update: updateFn,
      eq: eqFn,
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    await completeMission('m1');

    expect(mockSupabase.from).toHaveBeenCalledWith('daily_missions');
    expect(updateFn).toHaveBeenCalledWith(expect.objectContaining({ completed: true }));
    expect(eqFn).toHaveBeenCalledWith('id', 'm1');
  });
});

describe('addRewards', () => {
  it('calculates new level correctly', async () => {
    const updateBuilder = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(resolve),
    };
    const insertBuilder = {
      insert: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(resolve),
    };

    let callCount = 0;
    mockSupabase.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return updateBuilder as any;
      return insertBuilder as any;
    });

    const result = await addRewards('user-123', 180, 50, 1, 30, 10);

    // 180 + 30 = 210 XP → level 2 (threshold at 200)
    expect(result.newLevel).toBe(2);
    expect(result.leveledUp).toBe(true);
  });

  it('does not level up when XP stays in same tier', async () => {
    const updateBuilder = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(resolve),
    };
    const insertBuilder = {
      insert: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(resolve),
    };

    let callCount = 0;
    mockSupabase.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return updateBuilder as any;
      return insertBuilder as any;
    });

    const result = await addRewards('user-123', 100, 50, 1, 10, 5);

    // 100 + 10 = 110 XP → still level 1
    expect(result.newLevel).toBe(1);
    expect(result.leveledUp).toBe(false);
  });
});

describe('buyStreakFreeze', () => {
  it('throws when coins are insufficient', async () => {
    await expect(buyStreakFreeze('user-123', 30, 0)).rejects.toThrow('Insufficient coins');
  });

  it('deducts 50 coins on purchase', async () => {
    const updateFn = vi.fn().mockReturnThis();
    const updateBuilder = {
      update: updateFn,
      eq: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(resolve),
    };
    const insertBuilder = {
      insert: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(resolve),
    };

    let callCount = 0;
    mockSupabase.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return updateBuilder as any;
      return insertBuilder as any;
    });

    await buyStreakFreeze('user-123', 100, 2);

    expect(updateFn).toHaveBeenCalledWith(
      expect.objectContaining({ coins: 50, streak_freezes_available: 3 })
    );
  });
});

describe('ensureDailyMissions', () => {
  it('does not insert if missions already exist for today', async () => {
    const selectBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: [{ id: 'existing' }], error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(selectBuilder as any);

    await ensureDailyMissions('user-123');

    // from() should only be called once (the select check)
    expect(mockSupabase.from).toHaveBeenCalledTimes(1);
  });
});
