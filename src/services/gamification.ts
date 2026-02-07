import { supabase } from '@/integrations/supabase/client';

export interface GamificationRecord {
  level: number;
  xp: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  streakFreezesAvailable: number;
}

export interface DailyMissionRecord {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinsReward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  completed: boolean;
  missionType: string;
}

export interface BadgeRecord {
  id: string;
  badgeId: string;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  rarity: string;
  badgeCategory: string;
  unlockedAt: string;
}

export interface MysteryBoxRecord {
  id: string;
  boxType: string;
  opened: boolean;
  rewards: Record<string, unknown> | null;
  expiresAt: string | null;
}

const LEVEL_THRESHOLDS = [
  0, 200, 500, 1000, 1500, 3000, 5000, 6000, 10000, 15000, 20000, 30000, 40000, 60000, 80000,
  100000,
];

export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export async function fetchOrCreateGamification(userId: string): Promise<GamificationRecord> {
  const { data: existing, error } = await supabase
    .from('user_gamification')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  const record =
    existing ??
    (await (async () => {
      const { data: newRecord, error: insertError } = await supabase
        .from('user_gamification')
        .insert({
          user_id: userId,
          level: 1,
          xp: 0,
          coins: 0,
          current_streak: 0,
          longest_streak: 0,
          streak_freezes_available: 0,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return newRecord;
    })());

  return {
    level: record.level,
    xp: record.xp,
    coins: record.coins,
    currentStreak: record.current_streak,
    longestStreak: record.longest_streak,
    streakFreezesAvailable: record.streak_freezes_available,
  };
}

export async function fetchDailyMissions(userId: string): Promise<DailyMissionRecord[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('daily_missions')
    .select('*')
    .eq('user_id', userId)
    .eq('mission_date', today);

  if (error) throw error;

  return (
    data?.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      xpReward: m.xp_reward,
      coinsReward: m.coins_reward,
      difficulty: m.difficulty as 'easy' | 'medium' | 'hard',
      estimatedTime: m.estimated_time,
      completed: m.completed,
      missionType: m.mission_type,
    })) ?? []
  );
}

export async function fetchBadges(userId: string): Promise<BadgeRecord[]> {
  const { data, error } = await supabase
    .from('user_gamification_badges')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });

  if (error) throw error;

  return (
    data?.map((b) => ({
      id: b.id,
      badgeId: b.badge_id,
      badgeName: b.badge_name,
      badgeDescription: b.badge_description,
      badgeIcon: b.badge_icon,
      rarity: b.rarity,
      badgeCategory: b.badge_category,
      unlockedAt: b.unlocked_at,
    })) ?? []
  );
}

export async function fetchMysteryBoxes(userId: string): Promise<MysteryBoxRecord[]> {
  const { data, error } = await supabase
    .from('mystery_boxes')
    .select('*')
    .eq('user_id', userId)
    .eq('opened', false);

  if (error) throw error;

  return (
    data?.map((b) => ({
      id: b.id,
      boxType: b.box_type,
      opened: b.opened,
      rewards: b.rewards as Record<string, unknown> | null,
      expiresAt: b.expires_at,
    })) ?? []
  );
}

export async function completeMission(missionId: string): Promise<void> {
  const { error } = await supabase
    .from('daily_missions')
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq('id', missionId);

  if (error) throw error;
}

export async function addRewards(
  userId: string,
  currentXp: number,
  currentCoins: number,
  currentLevel: number,
  xp: number,
  coins: number
): Promise<{ newLevel: number; leveledUp: boolean }> {
  const newXp = currentXp + xp;
  const newCoins = currentCoins + coins;
  const newLevel = calculateLevel(newXp);
  const leveledUp = newLevel > currentLevel;

  const { error } = await supabase
    .from('user_gamification')
    .update({ xp: newXp, coins: newCoins, level: newLevel })
    .eq('user_id', userId);

  if (error) throw error;

  // Record transactions in parallel
  await Promise.all([
    supabase.from('xp_transactions').insert({
      user_id: userId,
      amount: xp,
      source: 'mission',
      description: 'Daily mission completed',
    }),
    supabase.from('coins_transactions').insert({
      user_id: userId,
      amount: coins,
      transaction_type: 'earned',
      source: 'mission',
      description: 'Daily mission reward',
    }),
  ]);

  return { newLevel, leveledUp };
}

export async function buyStreakFreeze(
  userId: string,
  currentCoins: number,
  currentFreezes: number
): Promise<void> {
  const FREEZE_COST = 50;

  if (currentCoins < FREEZE_COST) {
    throw new Error('Insufficient coins');
  }

  const { error } = await supabase
    .from('user_gamification')
    .update({
      coins: currentCoins - FREEZE_COST,
      streak_freezes_available: currentFreezes + 1,
    })
    .eq('user_id', userId);

  if (error) throw error;

  await supabase.from('coins_transactions').insert({
    user_id: userId,
    amount: -FREEZE_COST,
    transaction_type: 'spent',
    source: 'shop',
    description: 'Streak Freeze purchase',
  });
}

export function generateBoxRewards(_boxType: string): {
  rarity: string;
  xp: number;
  coins: number;
  badge?: string;
} {
  const random = Math.random();
  if (random < 0.01) {
    return { rarity: 'legendary', xp: 1000, coins: 1000, badge: 'Lucky' };
  } else if (random < 0.1) {
    return { rarity: 'epic', xp: 500, coins: 500 };
  } else if (random < 0.4) {
    return { rarity: 'rare', xp: 250, coins: 250 };
  } else {
    return { rarity: 'common', xp: 75, coins: 75 };
  }
}

export async function openMysteryBox(
  boxId: string,
  boxType: string
): Promise<{ rarity: string; xp: number; coins: number; badge?: string }> {
  const rewards = generateBoxRewards(boxType);

  const { error } = await supabase
    .from('mystery_boxes')
    .update({
      opened: true,
      opened_at: new Date().toISOString(),
      rewards,
    })
    .eq('id', boxId);

  if (error) throw error;

  return rewards;
}

export async function ensureDailyMissions(userId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const { data: existing } = await supabase
    .from('daily_missions')
    .select('id')
    .eq('user_id', userId)
    .eq('mission_date', today)
    .limit(1);

  if (existing && existing.length > 0) return;

  const defaultMissions = [
    {
      user_id: userId,
      mission_date: today,
      title: 'Morning Kickstart',
      description: 'Open Nova to start your day',
      mission_type: 'open_app',
      xp_reward: 10,
      coins_reward: 2,
      difficulty: 'easy',
      estimated_time: '30 sec',
    },
    {
      user_id: userId,
      mission_date: today,
      title: 'Quick PRD',
      description: 'Generate 1 PRD via Instant PRD',
      mission_type: 'create_prd',
      xp_reward: 50,
      coins_reward: 10,
      difficulty: 'easy',
      estimated_time: '2 min',
    },
    {
      user_id: userId,
      mission_date: today,
      title: 'Context Master',
      description: 'Update your product context',
      mission_type: 'update_context',
      xp_reward: 25,
      coins_reward: 5,
      difficulty: 'easy',
      estimated_time: '2 min',
    },
    {
      user_id: userId,
      mission_date: today,
      title: 'Workflow Warrior',
      description: 'Complete 1 full workflow',
      mission_type: 'complete_workflow',
      xp_reward: 100,
      coins_reward: 20,
      difficulty: 'medium',
      estimated_time: '20 min',
    },
    {
      user_id: userId,
      mission_date: today,
      title: 'Quality Craftsman',
      description: 'Get a Quality Score of 90+ on 1 artifact',
      mission_type: 'quality_score',
      xp_reward: 75,
      coins_reward: 15,
      difficulty: 'medium',
      estimated_time: '15 min',
    },
  ];

  await supabase.from('daily_missions').insert(defaultMissions);
}

export function subscribeToGamificationChanges(
  userId: string,
  onUpdate: (data: GamificationRecord) => void
) {
  const channel = supabase
    .channel('user-gamification-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_gamification',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.new && typeof payload.new === 'object') {
          const d = payload.new as Record<string, unknown>;
          onUpdate({
            level: (d.level as number) ?? 1,
            xp: (d.xp as number) ?? 0,
            coins: (d.coins as number) ?? 0,
            currentStreak: (d.current_streak as number) ?? 0,
            longestStreak: (d.longest_streak as number) ?? 0,
            streakFreezesAvailable: (d.streak_freezes_available as number) ?? 0,
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
