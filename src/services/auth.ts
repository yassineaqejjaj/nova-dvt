import { supabase } from '@/integrations/supabase/client';
import type { UserProfile, Squad, Badge } from '@/types';

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const [profileResult, gamificationResult, badgesResult, agentsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', userId).single(),
    supabase
      .from('user_gamification')
      .select('coins, current_streak, longest_streak')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('user_gamification_badges')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false }),
    supabase.from('unlocked_agents').select('agent_id').eq('user_id', userId),
  ]);

  if (profileResult.error && profileResult.error.code !== 'PGRST116') {
    throw profileResult.error;
  }
  if (gamificationResult.error) throw gamificationResult.error;
  if (badgesResult.error) throw badgesResult.error;
  if (agentsResult.error) throw agentsResult.error;

  const profile = profileResult.data;
  const gamification = gamificationResult.data;
  const badges = badgesResult.data;
  const unlockedAgents = agentsResult.data;

  return {
    id: userId,
    name: profile?.display_name || 'Anonymous User',
    role: profile?.role || 'Team Member',
    level: profile?.level || 1,
    xp: profile?.xp || 0,
    streak: gamification?.current_streak || 0,
    coins: gamification?.coins || 0,
    avatar_url: profile?.avatar_url ?? undefined,
    unlockedAgents: unlockedAgents?.map((ua) => ua.agent_id) || [],
    badges:
      badges?.map(
        (b): Badge => ({
          id: b.badge_id,
          name: b.badge_name,
          description: b.badge_description,
          icon: b.badge_icon,
          unlockedAt: new Date(b.unlocked_at),
          category: b.badge_category,
          rarity: b.rarity,
        })
      ) || [],
    longestStreak: gamification?.longest_streak || 0,
  };
}

export async function fetchUserSquads(userId: string): Promise<Squad[]> {
  const { data, error } = await supabase
    .from('squads')
    .select(
      `
      *,
      squad_agents (
        agent_id,
        agent_name,
        agent_specialty,
        agent_avatar,
        agent_backstory,
        agent_capabilities,
        agent_tags,
        agent_xp_required,
        agent_family_color
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (
    data?.map((squad) => ({
      id: squad.id,
      name: squad.name,
      purpose: squad.purpose || '',
      agents:
        squad.squad_agents?.map((sa: Record<string, unknown>) => ({
          id: sa.agent_id as string,
          name: sa.agent_name as string,
          specialty: sa.agent_specialty as string,
          avatar: sa.agent_avatar as string,
          backstory: sa.agent_backstory as string,
          capabilities: (sa.agent_capabilities as string[]) || [],
          tags: (sa.agent_tags as string[]) || [],
          xpRequired: sa.agent_xp_required as number,
          familyColor: sa.agent_family_color as 'blue' | 'green' | 'purple' | 'orange',
        })) || [],
      createdAt: new Date(squad.created_at),
    })) || []
  );
}

export async function updateUserXP(userId: string, newXP: number, newLevel: number): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ xp: newXP, level: newLevel })
    .eq('user_id', userId);

  if (error) throw error;
}

export async function fetchUserTheme(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('theme')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data?.theme ?? null;
}

export async function saveUserTheme(userId: string, themeId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ theme: themeId })
    .eq('user_id', userId);

  if (error) throw error;
}

export function subscribeToProfileChanges(
  userId: string,
  onUpdate: (payload: Record<string, unknown>) => void
) {
  const channel = supabase
    .channel('user-profile-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.new) {
          onUpdate(payload.new as Record<string, unknown>);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
