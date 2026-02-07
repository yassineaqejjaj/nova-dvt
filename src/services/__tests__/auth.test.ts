import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabase, resetSupabaseMocks } from '@/test/mocks/supabase';
import {
  fetchUserProfile,
  fetchUserSquads,
  updateUserXP,
  fetchUserTheme,
  saveUserTheme,
} from '../auth';

beforeEach(() => {
  resetSupabaseMocks();
});

describe('fetchUserProfile', () => {
  it('assembles profile from multiple tables', async () => {
    // We need to mock 4 parallel calls via Promise.all
    const profileBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          display_name: 'Alice',
          role: 'PM',
          level: 3,
          xp: 650,
          avatar_url: 'https://img.example.com/alice.png',
        },
        error: null,
      }),
    };

    const gamificationBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { coins: 120, current_streak: 5, longest_streak: 12 },
        error: null,
      }),
    };

    const badgesBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({
          data: [
            {
              badge_id: 'b1',
              badge_name: 'First Steps',
              badge_description: 'Complete onboarding',
              badge_icon: '🏆',
              unlocked_at: '2024-01-01T00:00:00Z',
              badge_category: 'onboarding',
              rarity: 'common',
            },
          ],
          error: null,
        }).then(resolve),
    };

    const agentsBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({
          data: [{ agent_id: 'agent-pm' }, { agent_id: 'agent-dev' }],
          error: null,
        }).then(resolve),
    };

    let callCount = 0;
    mockSupabase.from.mockImplementation(() => {
      callCount++;
      switch (callCount) {
        case 1:
          return profileBuilder as any;
        case 2:
          return gamificationBuilder as any;
        case 3:
          return badgesBuilder as any;
        case 4:
          return agentsBuilder as any;
        default:
          return profileBuilder as any;
      }
    });

    const result = await fetchUserProfile('user-123');

    expect(result).not.toBeNull();
    expect(result!.name).toBe('Alice');
    expect(result!.role).toBe('PM');
    expect(result!.level).toBe(3);
    expect(result!.xp).toBe(650);
    expect(result!.coins).toBe(120);
    expect(result!.streak).toBe(5);
    expect(result!.longestStreak).toBe(12);
    expect(result!.unlockedAgents).toEqual(['agent-pm', 'agent-dev']);
    expect(result!.badges).toHaveLength(1);
    expect(result!.badges[0].name).toBe('First Steps');
  });

  it('returns defaults when profile is missing', async () => {
    const profileBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      }),
    };

    const gamificationBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    const badgesBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: [], error: null }).then(resolve),
    };

    const agentsBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: [], error: null }).then(resolve),
    };

    let callCount = 0;
    mockSupabase.from.mockImplementation(() => {
      callCount++;
      switch (callCount) {
        case 1:
          return profileBuilder as any;
        case 2:
          return gamificationBuilder as any;
        case 3:
          return badgesBuilder as any;
        case 4:
          return agentsBuilder as any;
        default:
          return profileBuilder as any;
      }
    });

    const result = await fetchUserProfile('user-123');

    expect(result!.name).toBe('Anonymous User');
    expect(result!.role).toBe('Team Member');
    expect(result!.level).toBe(1);
    expect(result!.xp).toBe(0);
    expect(result!.coins).toBe(0);
    expect(result!.streak).toBe(0);
  });
});

describe('fetchUserSquads', () => {
  it('returns mapped squads with agents', async () => {
    const mockSquads = [
      {
        id: 'sq1',
        name: 'Product Squad',
        purpose: 'Build features',
        created_at: '2024-01-01T00:00:00Z',
        squad_agents: [
          {
            agent_id: 'a1',
            agent_name: 'PM Agent',
            agent_specialty: 'Product Management',
            agent_avatar: '👤',
            agent_backstory: 'Expert PM',
            agent_capabilities: ['roadmapping', 'prioritization'],
            agent_tags: ['product'],
            agent_xp_required: 0,
            agent_family_color: 'blue',
          },
        ],
      },
    ];

    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: mockSquads, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const result = await fetchUserSquads('user-123');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Product Squad');
    expect(result[0].agents).toHaveLength(1);
    expect(result[0].agents[0].name).toBe('PM Agent');
    expect(result[0].agents[0].familyColor).toBe('blue');
  });

  it('returns empty array when user has no squads', async () => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: [], error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const result = await fetchUserSquads('user-123');
    expect(result).toEqual([]);
  });
});

describe('updateUserXP', () => {
  it('updates profile with new XP and level', async () => {
    const updateFn = vi.fn().mockReturnThis();
    const eqFn = vi.fn().mockReturnThis();
    const builder = {
      update: updateFn,
      eq: eqFn,
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    await updateUserXP('user-123', 500, 3);

    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    expect(updateFn).toHaveBeenCalledWith({ xp: 500, level: 3 });
    expect(eqFn).toHaveBeenCalledWith('user_id', 'user-123');
  });
});

describe('fetchUserTheme', () => {
  it('returns the theme string when set', async () => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { theme: 'cardinal' }, error: null }),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const result = await fetchUserTheme('user-123');
    expect(result).toBe('cardinal');
  });

  it('returns null when theme is not set', async () => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { theme: null }, error: null }),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    const result = await fetchUserTheme('user-123');
    expect(result).toBeNull();
  });
});

describe('saveUserTheme', () => {
  it('updates the theme in profiles table', async () => {
    const updateFn = vi.fn().mockReturnThis();
    const eqFn = vi.fn().mockReturnThis();
    const builder = {
      update: updateFn,
      eq: eqFn,
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({ data: null, error: null }).then(resolve),
    };
    mockSupabase.from.mockReturnValue(builder as any);

    await saveUserTheme('user-123', 'midnight-dark');

    expect(updateFn).toHaveBeenCalledWith({ theme: 'midnight-dark' });
    expect(eqFn).toHaveBeenCalledWith('user_id', 'user-123');
  });
});
