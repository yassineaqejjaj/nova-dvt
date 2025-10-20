import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserProfile, Squad, Badge } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

export const useAuth = () => {
  const { loadUserTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    let profileChannel: ReturnType<typeof supabase.channel> | null = null;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
        loadUserSquads(session.user.id);
        loadUserTheme(session.user.id);

        // Set up realtime subscription for profile updates
        profileChannel = supabase
          .channel('user-profile-changes')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `user_id=eq.${session.user.id}`
            },
            (payload) => {
              console.log('Profile update received:', payload);
              if (payload.new) {
                setUserProfile(prev => prev ? {
                  ...prev,
                  level: payload.new.level,
                  xp: payload.new.xp
                } : null);
              }
            }
          )
          .subscribe();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadUserProfile(session.user.id);
          loadUserSquads(session.user.id);
          setTimeout(() => {
            loadUserTheme(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
          setSquads([]);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      if (profileChannel) {
        supabase.removeChannel(profileChannel);
      }
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      // Load profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Load gamification data (coins and streak)
      const { data: gamification, error: gamificationError } = await supabase
        .from('user_gamification')
        .select('coins, current_streak, longest_streak')
        .eq('user_id', userId)
        .maybeSingle();

      if (gamificationError) throw gamificationError;

      // Load badges from user_gamification_badges
      const { data: badges, error: badgesError } = await supabase
        .from('user_gamification_badges')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (badgesError) throw badgesError;

      // Load unlocked agents
      const { data: unlockedAgents, error: agentsError } = await supabase
        .from('unlocked_agents')
        .select('agent_id')
        .eq('user_id', userId);

      if (agentsError) throw agentsError;

      const userProfile: UserProfile = {
        id: userId,
        name: profile?.display_name || 'Anonymous User',
        role: profile?.role || 'Team Member',
        level: profile?.level || 1,
        xp: profile?.xp || 0,
        streak: gamification?.current_streak || 0,
        coins: gamification?.coins || 0,
        avatar_url: profile?.avatar_url,
        unlockedAgents: unlockedAgents?.map(ua => ua.agent_id) || [],
        badges: badges?.map(b => ({
          id: b.badge_id,
          name: b.badge_name,
          description: b.badge_description,
          icon: b.badge_icon,
          unlockedAt: new Date(b.unlocked_at),
          category: b.badge_category,
          rarity: b.rarity
        })) || [],
        longestStreak: gamification?.longest_streak || 0
      };

      setUserProfile(userProfile);
      
      // Check if user needs onboarding (no display_name set yet)
      // Only set to true if onboarding hasn't been manually completed
      if ((!profile || !profile.display_name) && !onboardingCompleted) {
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSquads = async (userId: string) => {
    try {
      // Load squads with their agents
      const { data: squadsData, error: squadsError } = await supabase
        .from('squads')
        .select(`
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
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (squadsError) throw squadsError;

      const transformedSquads: Squad[] = squadsData?.map(squad => ({
        id: squad.id,
        name: squad.name,
        purpose: squad.purpose || '',
        agents: squad.squad_agents?.map((sa: any) => ({
          id: sa.agent_id,
          name: sa.agent_name,
          specialty: sa.agent_specialty,
          avatar: sa.agent_avatar,
          backstory: sa.agent_backstory,
          capabilities: sa.agent_capabilities || [],
          tags: sa.agent_tags || [],
          xpRequired: sa.agent_xp_required,
          familyColor: sa.agent_family_color as 'blue' | 'green' | 'purple' | 'orange'
        })) || [],
        createdAt: new Date(squad.created_at)
      })) || [];

      setSquads(transformedSquads);
    } catch (error) {
      console.error('Error loading user squads:', error);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await loadUserProfile(user.id);
      await loadUserSquads(user.id);
    }
  };

  const addXP = async (amount: number, reason: string) => {
    if (!user || !userProfile) return;

    const newXP = userProfile.xp + amount;
    const newLevel = Math.floor(newXP / 200) + 1;
    const leveledUp = newLevel > userProfile.level;

    try {
      await supabase
        .from('profiles')
        .update({ 
          xp: newXP, 
          level: newLevel 
        })
        .eq('user_id', user.id);

      // Update local state
      setUserProfile(prev => prev ? {
        ...prev,
        xp: newXP,
        level: newLevel
      } : null);

      return { leveledUp, newLevel };
    } catch (error) {
      console.error('Error adding XP:', error);
      return { leveledUp: false, newLevel: userProfile.level };
    }
  };

  const completeOnboarding = () => {
    setNeedsOnboarding(false);
    setOnboardingCompleted(true);
  };

  return {
    user,
    userProfile,
    squads,
    loading,
    needsOnboarding,
    refreshUserData,
    addXP,
    completeOnboarding
  };
};