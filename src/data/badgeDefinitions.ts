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
    name: 'Bienvenue à Bord',
    description: 'Rejoignez Nova et démarrez votre parcours de product management',
    icon: '🎉',
    category: 'getting_started',
    rarity: 'common',
    requirement: 'Créer votre premier compte',
    xpReward: 50,
    coinsReward: 10
  },
  {
    id: 'first_squad',
    name: 'Chef d\'Équipe',
    description: 'Créez votre première squad IA',
    icon: '👥',
    category: 'getting_started',
    rarity: 'common',
    requirement: 'Créer 1 squad',
    xpReward: 100,
    coinsReward: 20
  },
  {
    id: 'first_agent',
    name: 'Recruteur',
    description: 'Débloquez votre premier agent IA',
    icon: '🤝',
    category: 'getting_started',
    rarity: 'common',
    requirement: 'Débloquer 1 agent',
    xpReward: 75,
    coinsReward: 15
  },
  {
    id: 'first_chat',
    name: 'Premier Contact',
    description: 'Ayez votre première conversation avec un agent IA',
    icon: '💬',
    category: 'getting_started',
    rarity: 'common',
    requirement: 'Envoyer 1 message',
    xpReward: 50,
    coinsReward: 10
  },

  // Collaboration
  {
    id: 'team_player',
    name: 'Esprit d\'Équipe',
    description: 'Travaillez avec plusieurs agents dans une seule conversation',
    icon: '🤝',
    category: 'collaboration',
    rarity: 'rare',
    requirement: 'Utiliser 3+ agents dans un chat',
    xpReward: 200,
    coinsReward: 40
  },
  {
    id: 'agent_collector',
    name: 'Collectionneur d\'Agents',
    description: 'Débloquez 10 agents IA différents',
    icon: '🎭',
    category: 'collaboration',
    rarity: 'rare',
    requirement: 'Débloquer 10 agents',
    xpReward: 300,
    coinsReward: 60
  },
  {
    id: 'squad_master',
    name: 'Maître des Squads',
    description: 'Créez 5 squads spécialisées',
    icon: '⚡',
    category: 'collaboration',
    rarity: 'epic',
    requirement: 'Créer 5 squads',
    xpReward: 500,
    coinsReward: 100
  },
  {
    id: 'full_team',
    name: 'Équipe Complète',
    description: 'Créez une squad avec 5 agents',
    icon: '👨‍👩‍👧‍👦',
    category: 'collaboration',
    rarity: 'rare',
    requirement: 'Ajouter 5 agents à une squad',
    xpReward: 250,
    coinsReward: 50
  },

  // Productivity
  {
    id: 'canvas_creator',
    name: 'Créateur de Canvas',
    description: 'Générez votre premier canvas métier',
    icon: '🎨',
    category: 'productivity',
    rarity: 'rare',
    requirement: 'Créer 1 canvas',
    xpReward: 150,
    coinsReward: 30
  },
  {
    id: 'prd_master',
    name: 'Maître PRD',
    description: 'Créez un Product Requirements Document complet',
    icon: '📝',
    category: 'productivity',
    rarity: 'rare',
    requirement: 'Générer 1 PRD',
    xpReward: 200,
    coinsReward: 40
  },
  {
    id: 'artifact_creator',
    name: 'Créateur d\'Artefacts',
    description: 'Créez 10 artefacts différents',
    icon: '📦',
    category: 'productivity',
    rarity: 'epic',
    requirement: 'Créer 10 artefacts',
    xpReward: 400,
    coinsReward: 80
  },
  {
    id: 'speed_demon',
    name: 'Démon de Vitesse',
    description: 'Utiliser Instant Product Requirements Document pour générer la doc en moins de 20 secondes',
    icon: '⚡',
    category: 'productivity',
    rarity: 'epic',
    requirement: 'Utiliser Instant Product Requirements Document',
    xpReward: 300,
    coinsReward: 60
  },
  {
    id: 'multi_framework',
    name: 'Expert des Frameworks',
    description: 'Générez 5 types de canvas différents',
    icon: '🗺️',
    category: 'productivity',
    rarity: 'epic',
    requirement: 'Créer 5 types de canvas différents',
    xpReward: 350,
    coinsReward: 70
  },

  // Mastery
  {
    id: 'level_10',
    name: 'Étoile Montante',
    description: 'Atteignez le niveau 10',
    icon: '⭐',
    category: 'mastery',
    rarity: 'rare',
    requirement: 'Atteindre le niveau 10',
    xpReward: 500,
    coinsReward: 100
  },
  {
    id: 'level_25',
    name: 'Expert',
    description: 'Atteignez le niveau 25',
    icon: '🏆',
    category: 'mastery',
    rarity: 'epic',
    requirement: 'Atteindre le niveau 25',
    xpReward: 1000,
    coinsReward: 200
  },
  {
    id: 'level_50',
    name: 'Maître',
    description: 'Atteignez le niveau 50',
    icon: '👑',
    category: 'mastery',
    rarity: 'legendary',
    requirement: 'Atteindre le niveau 50',
    xpReward: 2000,
    coinsReward: 500
  },
  {
    id: 'streak_7',
    name: 'Guerrier de la Semaine',
    description: 'Maintenez une série de 7 jours',
    icon: '🔥',
    category: 'mastery',
    rarity: 'rare',
    requirement: 'Série de 7 jours',
    xpReward: 300,
    coinsReward: 60
  },
  {
    id: 'streak_30',
    name: 'Champion du Mois',
    description: 'Maintenez une série de 30 jours',
    icon: '🌟',
    category: 'mastery',
    rarity: 'epic',
    requirement: 'Série de 30 jours',
    xpReward: 750,
    coinsReward: 150
  },
  {
    id: 'streak_100',
    name: 'Club du Siècle',
    description: 'Maintenez une série de 100 jours',
    icon: '💯',
    category: 'mastery',
    rarity: 'legendary',
    requirement: 'Série de 100 jours',
    xpReward: 2000,
    coinsReward: 400
  },

  // Social
  {
    id: 'share_first',
    name: 'Partage et Succès',
    description: 'Partagez votre première réussite',
    icon: '📢',
    category: 'social',
    rarity: 'common',
    requirement: 'Partager 1 moment',
    xpReward: 100,
    coinsReward: 20
  },
  {
    id: 'influencer',
    name: 'Influenceur Nova',
    description: 'Partagez 10 réussites sur les réseaux sociaux',
    icon: '📱',
    category: 'social',
    rarity: 'rare',
    requirement: 'Partager 10 moments',
    xpReward: 300,
    coinsReward: 60
  },

  // Special
  {
    id: 'early_adopter',
    name: 'Adopteur Précoce',
    description: 'Rejoignez Nova pendant sa phase d\'accès anticipé',
    icon: '🚀',
    category: 'special',
    rarity: 'legendary',
    requirement: 'Rejoindre pendant l\'accès anticipé',
    xpReward: 1000,
    coinsReward: 200
  },
  {
    id: 'beta_tester',
    name: 'Testeur Bêta',
    description: 'Aidez à façonner Nova en testant les nouvelles fonctionnalités',
    icon: '🧪',
    category: 'special',
    rarity: 'epic',
    requirement: 'Tester les fonctionnalités bêta',
    xpReward: 500,
    coinsReward: 100
  },
  {
    id: 'bug_hunter',
    name: 'Chasseur de Bugs',
    description: 'Signalez un bug qui aide à améliorer Nova',
    icon: '🐛',
    category: 'special',
    rarity: 'rare',
    requirement: 'Signaler 1 bug',
    xpReward: 250,
    coinsReward: 50
  },
  {
    id: 'power_user',
    name: 'Utilisateur Puissant',
    description: 'Complétez 100 missions',
    icon: '💪',
    category: 'special',
    rarity: 'legendary',
    requirement: 'Compléter 100 missions',
    xpReward: 2000,
    coinsReward: 500
  },
  {
    id: 'completionist',
    name: 'Perfectionniste',
    description: 'Débloquez tous les agents disponibles',
    icon: '🎯',
    category: 'special',
    rarity: 'legendary',
    requirement: 'Débloquer tous les agents',
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
  getting_started: 'Débuter',
  collaboration: 'Collaboration',
  productivity: 'Productivité',
  mastery: 'Maîtrise',
  social: 'Social',
  special: 'Spécial'
};

export const categoryIcons: Record<BadgeCategory, string> = {
  getting_started: '🎯',
  collaboration: '🤝',
  productivity: '⚡',
  mastery: '👑',
  social: '📢',
  special: '✨'
};