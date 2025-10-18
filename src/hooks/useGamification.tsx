import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GamificationStats {
  level: number;
  xp: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  streakFreezesAvailable: number;
}

export interface DailyMission {
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

export interface Badge {
  id: string;
  badgeId: string;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  rarity: string;
  badgeCategory: string;
  unlockedAt: string;
}

export interface MysteryBox {
  id: string;
  boxType: string;
  opened: boolean;
  rewards: any;
  expiresAt: string | null;
}

export const useGamification = (userId: string | undefined) => {
  const { toast } = useToast();
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [mysteryBoxes, setMysteryBoxes] = useState<MysteryBox[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    loadGamificationData();
    // Auto-generate missions if none exist for today
    generateMissionsIfNeeded();

    // Set up realtime subscription for gamification updates
    const channel = supabase
      .channel('user-gamification-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_gamification',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Gamification update received:', payload);
          if (payload.new && typeof payload.new === 'object') {
            const newData = payload.new as any;
            setStats({
              level: newData.level ?? 1,
              xp: newData.xp ?? 0,
              coins: newData.coins ?? 0,
              currentStreak: newData.current_streak ?? 0,
              longestStreak: newData.longest_streak ?? 0,
              streakFreezesAvailable: newData.streak_freezes_available ?? 0
            });

            // Show toast for level up
            if (payload.old && typeof payload.old === 'object') {
              const oldData = payload.old as any;
              if (newData.level > oldData.level) {
                toast({
                  title: "🎉 LEVEL UP!",
                  description: `Vous êtes maintenant niveau ${newData.level}!`,
                });
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const generateMissionsIfNeeded = async () => {
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('daily_missions')
      .select('id')
      .eq('user_id', userId)
      .eq('mission_date', today)
      .limit(1);

    if (!existing || existing.length === 0) {
      // Generate default missions for today
      const defaultMissions = [
        {
          user_id: userId,
          mission_date: today,
          title: "Morning Kickstart",
          description: "Ouvre Nova pour commencer ta journée",
          mission_type: "open_app",
          xp_reward: 10,
          coins_reward: 2,
          difficulty: "easy",
          estimated_time: "30 sec"
        },
        {
          user_id: userId,
          mission_date: today,
          title: "PRD Rapide",
          description: "Génère 1 PRD via Instant Product Requirements Document",
          mission_type: "create_prd",
          xp_reward: 50,
          coins_reward: 10,
          difficulty: "easy",
          estimated_time: "2 min"
        },
        {
          user_id: userId,
          mission_date: today,
          title: "Context Master",
          description: "Mets à jour ton contexte projet",
          mission_type: "update_context",
          xp_reward: 25,
          coins_reward: 5,
          difficulty: "easy",
          estimated_time: "2 min"
        },
        {
          user_id: userId,
          mission_date: today,
          title: "Workflow Warrior",
          description: "Complète 1 workflow complet",
          mission_type: "complete_workflow",
          xp_reward: 100,
          coins_reward: 20,
          difficulty: "medium",
          estimated_time: "20 min"
        },
        {
          user_id: userId,
          mission_date: today,
          title: "Quality Craftsman",
          description: "Obtiens un Quality Score ≥90 sur 1 artefact",
          mission_type: "quality_score",
          xp_reward: 75,
          coins_reward: 15,
          difficulty: "medium",
          estimated_time: "15 min"
        }
      ];

      await supabase.from('daily_missions').insert(defaultMissions);
    }
  };

  const loadGamificationData = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Load or create user_gamification record
      let { data: gamificationData, error: gamificationError } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // If no gamification record exists, create one
      if (!gamificationData) {
        const { data: newRecord, error: insertError } = await supabase
          .from('user_gamification')
          .insert({
            user_id: userId,
            level: 1,
            xp: 0,
            coins: 0,
            current_streak: 0,
            longest_streak: 0,
            streak_freezes_available: 0
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating gamification record:', insertError);
        } else {
          gamificationData = newRecord;
        }
      }

      if (gamificationData) {
        setStats({
          level: gamificationData.level,
          xp: gamificationData.xp,
          coins: gamificationData.coins,
          currentStreak: gamificationData.current_streak,
          longestStreak: gamificationData.longest_streak,
          streakFreezesAvailable: gamificationData.streak_freezes_available
        });
      }

      // Load daily missions
      const today = new Date().toISOString().split('T')[0];
      const { data: missionsData } = await supabase
        .from('daily_missions')
        .select('*')
        .eq('user_id', userId)
        .eq('mission_date', today);

      if (missionsData) {
        setMissions(missionsData.map(m => ({
          id: m.id,
          title: m.title,
          description: m.description,
          xpReward: m.xp_reward,
          coinsReward: m.coins_reward,
          difficulty: m.difficulty as 'easy' | 'medium' | 'hard',
          estimatedTime: m.estimated_time,
          completed: m.completed,
          missionType: m.mission_type
        })));
      }

      // Load badges
      const { data: badgesData } = await supabase
        .from('user_gamification_badges')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (badgesData) {
        setBadges(badgesData.map(b => ({
          id: b.id,
          badgeId: b.badge_id,
          badgeName: b.badge_name,
          badgeDescription: b.badge_description,
          badgeIcon: b.badge_icon,
          rarity: b.rarity,
          badgeCategory: b.badge_category,
          unlockedAt: b.unlocked_at
        })));
      }

      // Load mystery boxes
      const { data: boxesData } = await supabase
        .from('mystery_boxes')
        .select('*')
        .eq('user_id', userId)
        .eq('opened', false);

      if (boxesData) {
        setMysteryBoxes(boxesData.map(b => ({
          id: b.id,
          boxType: b.box_type,
          opened: b.opened,
          rewards: b.rewards,
          expiresAt: b.expires_at
        })));
      }

    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeMission = async (missionId: string) => {
    if (!userId) return;

    try {
      const mission = missions.find(m => m.id === missionId);
      if (!mission) return;

      // Mark mission as completed
      const { error } = await supabase
        .from('daily_missions')
        .update({ 
          completed: true, 
          completed_at: new Date().toISOString() 
        })
        .eq('id', missionId);

      if (error) throw error;

      // Add XP and coins
      await addRewards(mission.xpReward, mission.coinsReward);

      toast({
        title: "Mission Complétée! 🎉",
        description: `+${mission.xpReward} XP, +${mission.coinsReward} coins`,
      });

      loadGamificationData();
    } catch (error) {
      console.error('Error completing mission:', error);
      toast({
        title: "Erreur",
        description: "Impossible de compléter la mission",
        variant: "destructive"
      });
    }
  };

  const addRewards = async (xp: number, coins: number) => {
    if (!userId || !stats) return;

    const newXp = stats.xp + xp;
    const newCoins = stats.coins + coins;

    // Check for level up
    const newLevel = calculateLevel(newXp);
    const leveledUp = newLevel > stats.level;

    await supabase
      .from('user_gamification')
      .update({ 
        xp: newXp, 
        coins: newCoins,
        level: newLevel
      })
      .eq('user_id', userId);

    // Record transactions
    await supabase.from('xp_transactions').insert({
      user_id: userId,
      amount: xp,
      source: 'mission',
      description: 'Daily mission completed'
    });

    await supabase.from('coins_transactions').insert({
      user_id: userId,
      amount: coins,
      transaction_type: 'earned',
      source: 'mission',
      description: 'Daily mission reward'
    });

    if (leveledUp) {
      toast({
        title: "🎉 LEVEL UP!",
        description: `Vous êtes maintenant niveau ${newLevel}!`,
      });
    }
  };

  const calculateLevel = (xp: number): number => {
    const levels = [0, 200, 500, 1000, 1500, 3000, 5000, 6000, 10000, 15000, 20000, 30000, 40000, 60000, 80000, 100000];
    for (let i = levels.length - 1; i >= 0; i--) {
      if (xp >= levels[i]) return i + 1;
    }
    return 1;
  };

  const openMysteryBox = async (boxId: string) => {
    if (!userId) return;

    try {
      const box = mysteryBoxes.find(b => b.id === boxId);
      if (!box) return;

      // Generate random reward
      const rewards = generateBoxRewards(box.boxType);

      await supabase
        .from('mystery_boxes')
        .update({ 
          opened: true, 
          opened_at: new Date().toISOString(),
          rewards 
        })
        .eq('id', boxId);

      await addRewards(rewards.xp || 0, rewards.coins || 0);

      toast({
        title: "🎁 Mystery Box Ouverte!",
        description: `Vous avez gagné: ${rewards.xp} XP, ${rewards.coins} coins`,
      });

      loadGamificationData();
      return rewards;
    } catch (error) {
      console.error('Error opening mystery box:', error);
    }
  };

  const generateBoxRewards = (boxType: string) => {
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
  };

  const buyStreakFreeze = async () => {
    if (!userId || !stats || stats.coins < 50) {
      toast({
        title: "Coins insuffisants",
        description: "Il vous faut 50 coins pour acheter un Streak Freeze",
        variant: "destructive"
      });
      return;
    }

    try {
      await supabase
        .from('user_gamification')
        .update({ 
          coins: stats.coins - 50,
          streak_freezes_available: stats.streakFreezesAvailable + 1
        })
        .eq('user_id', userId);

      await supabase.from('coins_transactions').insert({
        user_id: userId,
        amount: -50,
        transaction_type: 'spent',
        source: 'shop',
        description: 'Streak Freeze purchase'
      });

      toast({
        title: "🛡️ Streak Freeze Acheté!",
        description: "Vous pouvez maintenant sauter un jour sans perdre votre streak",
      });

      loadGamificationData();
    } catch (error) {
      console.error('Error buying streak freeze:', error);
    }
  };

  return {
    stats,
    missions,
    badges,
    mysteryBoxes,
    loading,
    completeMission,
    openMysteryBox,
    buyStreakFreeze,
    refresh: loadGamificationData
  };
};
