export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  requirement: string;
  xpReward?: number;
  coinsReward?: number;
}

export type BadgeCategory = 
  | 'getting_started' 
  | 'collaboration' 
  | 'productivity' 
  | 'mastery' 
  | 'social' 
  | 'special';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export const badgeDefinitions: BadgeDefinition[] = [
  // Getting Started
  {
    id: 'welcome',
    name: 'Welcome Aboard',
    description: 'Join Nova and start your product management journey',
    icon: '🎉',
    category: 'getting_started',
    rarity: 'common',
    requirement: 'Create your first account',
    xpReward: 50,
    coinsReward: 10
  },
  {
    id: 'first_squad',
    name: 'Squad Leader',
    description: 'Create your first AI squad',
    icon: '👥',
    category: 'getting_started',
    rarity: 'common',
    requirement: 'Create 1 squad',
    xpReward: 100,
    coinsReward: 20
  },
  {
    id: 'first_agent',
    name: 'Recruiter',
    description: 'Unlock your first AI agent',
    icon: '🤝',
    category: 'getting_started',
    rarity: 'common',
    requirement: 'Unlock 1 agent',
    xpReward: 75,
    coinsReward: 15
  },
  {
    id: 'first_chat',
    name: 'Conversation Starter',
    description: 'Have your first conversation with an AI agent',
    icon: '💬',
    category: 'getting_started',
    rarity: 'common',
    requirement: 'Send 1 message',
    xpReward: 50,
    coinsReward: 10
  },

  // Collaboration
  {
    id: 'team_player',
    name: 'Team Player',
    description: 'Work with multiple agents in a single conversation',
    icon: '🤝',
    category: 'collaboration',
    rarity: 'rare',
    requirement: 'Use 3+ agents in one chat',
    xpReward: 200,
    coinsReward: 40
  },
  {
    id: 'agent_collector',
    name: 'Agent Collector',
    description: 'Unlock 10 different AI agents',
    icon: '🎭',
    category: 'collaboration',
    rarity: 'rare',
    requirement: 'Unlock 10 agents',
    xpReward: 300,
    coinsReward: 60
  },
  {
    id: 'squad_master',
    name: 'Squad Master',
    description: 'Create 5 specialized squads',
    icon: '⚡',
    category: 'collaboration',
    rarity: 'epic',
    requirement: 'Create 5 squads',
    xpReward: 500,
    coinsReward: 100
  },
  {
    id: 'full_team',
    name: 'Full Team',
    description: 'Create a squad with 5 agents',
    icon: '👨‍👩‍👧‍👦',
    category: 'collaboration',
    rarity: 'rare',
    requirement: 'Add 5 agents to one squad',
    xpReward: 250,
    coinsReward: 50
  },

  // Productivity
  {
    id: 'canvas_creator',
    name: 'Canvas Creator',
    description: 'Generate your first business canvas',
    icon: '🎨',
    category: 'productivity',
    rarity: 'rare',
    requirement: 'Create 1 canvas',
    xpReward: 150,
    coinsReward: 30
  },
  {
    id: 'prd_master',
    name: 'PRD Master',
    description: 'Create a complete Product Requirements Document',
    icon: '📝',
    category: 'productivity',
    rarity: 'rare',
    requirement: 'Generate 1 PRD',
    xpReward: 200,
    coinsReward: 40
  },
  {
    id: 'artifact_creator',
    name: 'Artifact Creator',
    description: 'Create 10 different artifacts',
    icon: '📦',
    category: 'productivity',
    rarity: 'epic',
    requirement: 'Create 10 artifacts',
    xpReward: 400,
    coinsReward: 80
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Use Instant PRD to generate documentation in under 20 seconds',
    icon: '⚡',
    category: 'productivity',
    rarity: 'epic',
    requirement: 'Use Instant PRD',
    xpReward: 300,
    coinsReward: 60
  },
  {
    id: 'multi_framework',
    name: 'Framework Expert',
    description: 'Generate 5 different types of canvases',
    icon: '🗺️',
    category: 'productivity',
    rarity: 'epic',
    requirement: 'Create 5 different canvas types',
    xpReward: 350,
    coinsReward: 70
  },

  // Mastery
  {
    id: 'level_10',
    name: 'Rising Star',
    description: 'Reach level 10',
    icon: '⭐',
    category: 'mastery',
    rarity: 'rare',
    requirement: 'Reach level 10',
    xpReward: 500,
    coinsReward: 100
  },
  {
    id: 'level_25',
    name: 'Expert',
    description: 'Reach level 25',
    icon: '🏆',
    category: 'mastery',
    rarity: 'epic',
    requirement: 'Reach level 25',
    xpReward: 1000,
    coinsReward: 200
  },
  {
    id: 'level_50',
    name: 'Master',
    description: 'Reach level 50',
    icon: '👑',
    category: 'mastery',
    rarity: 'legendary',
    requirement: 'Reach level 50',
    xpReward: 2000,
    coinsReward: 500
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    category: 'mastery',
    rarity: 'rare',
    requirement: '7-day streak',
    xpReward: 300,
    coinsReward: 60
  },
  {
    id: 'streak_30',
    name: 'Month Champion',
    description: 'Maintain a 30-day streak',
    icon: '🌟',
    category: 'mastery',
    rarity: 'epic',
    requirement: '30-day streak',
    xpReward: 750,
    coinsReward: 150
  },
  {
    id: 'streak_100',
    name: 'Century Club',
    description: 'Maintain a 100-day streak',
    icon: '💯',
    category: 'mastery',
    rarity: 'legendary',
    requirement: '100-day streak',
    xpReward: 2000,
    coinsReward: 400
  },

  // Social
  {
    id: 'share_first',
    name: 'Sharing is Caring',
    description: 'Share your first achievement',
    icon: '📢',
    category: 'social',
    rarity: 'common',
    requirement: 'Share 1 moment',
    xpReward: 100,
    coinsReward: 20
  },
  {
    id: 'influencer',
    name: 'Nova Influencer',
    description: 'Share 10 achievements on social media',
    icon: '📱',
    category: 'social',
    rarity: 'rare',
    requirement: 'Share 10 moments',
    xpReward: 300,
    coinsReward: 60
  },

  // Special
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Join Nova during its early access phase',
    icon: '🚀',
    category: 'special',
    rarity: 'legendary',
    requirement: 'Join during early access',
    xpReward: 1000,
    coinsReward: 200
  },
  {
    id: 'beta_tester',
    name: 'Beta Tester',
    description: 'Help shape Nova by testing new features',
    icon: '🧪',
    category: 'special',
    rarity: 'epic',
    requirement: 'Test beta features',
    xpReward: 500,
    coinsReward: 100
  },
  {
    id: 'bug_hunter',
    name: 'Bug Hunter',
    description: 'Report a bug that helps improve Nova',
    icon: '🐛',
    category: 'special',
    rarity: 'rare',
    requirement: 'Report 1 bug',
    xpReward: 250,
    coinsReward: 50
  },
  {
    id: 'power_user',
    name: 'Power User',
    description: 'Complete 100 missions',
    icon: '💪',
    category: 'special',
    rarity: 'legendary',
    requirement: 'Complete 100 missions',
    xpReward: 2000,
    coinsReward: 500
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Unlock all available agents',
    icon: '🎯',
    category: 'special',
    rarity: 'legendary',
    requirement: 'Unlock all agents',
    xpReward: 3000,
    coinsReward: 750
  }
];

export const getBadgesByCategory = (category: BadgeCategory) => {
  return badgeDefinitions.filter(badge => badge.category === category);
};

export const getBadgesByRarity = (rarity: BadgeRarity) => {
  return badgeDefinitions.filter(badge => badge.rarity === rarity);
};

export const getBadgeById = (id: string) => {
  return badgeDefinitions.find(badge => badge.id === id);
};

export const categoryLabels: Record<BadgeCategory, string> = {
  getting_started: 'Getting Started',
  collaboration: 'Collaboration',
  productivity: 'Productivity',
  mastery: 'Mastery',
  social: 'Social',
  special: 'Special'
};

export const categoryIcons: Record<BadgeCategory, string> = {
  getting_started: '🎯',
  collaboration: '🤝',
  productivity: '⚡',
  mastery: '👑',
  social: '📢',
  special: '✨'
};