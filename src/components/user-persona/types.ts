export interface ProductContext {
  id: string;
  name: string;
  vision: string | null;
  objectives: string[] | null;
  target_audience: string | null;
  target_kpis: string[] | null;
  constraints: string | null;
}

export type ResearchIntent = 
  | 'understand_users'
  | 'frame_discovery'
  | 'prioritize_features'
  | 'align_decisions';

export type DetailLevel = 'synthesis' | 'standard' | 'detailed';
export type PersonaOrientation = 'needs' | 'frustrations' | 'decisions';

export interface PersonaConfig {
  personaCount: 1 | 2 | 3;
  detailLevel: DetailLevel;
  orientation: PersonaOrientation;
}

export interface GeneratedPersona {
  id: string;
  name: string;
  age: number;
  role: string;
  location: string;
  bio: string;
  goals: string[];
  painPoints: string[];
  motivations: string[];
  behaviors: string[];
  decisionFactors: string[];
  techSavviness: string;
  preferredChannels: string[];
  selected: boolean;
}

export interface PersonaFlowState {
  step: number;
  context: ProductContext | null;
  intent: ResearchIntent | null;
  productDescription: string;
  targetAudience: string;
  config: PersonaConfig;
  personas: GeneratedPersona[];
  isGenerating: boolean;
}

export const INTENT_OPTIONS: { value: ResearchIntent; label: string; description: string }[] = [
  { 
    value: 'understand_users', 
    label: 'Comprendre mes utilisateurs', 
    description: 'Explorer les besoins, comportements et motivations' 
  },
  { 
    value: 'frame_discovery', 
    label: 'Cadrer une discovery', 
    description: 'Orienter la recherche utilisateur à venir' 
  },
  { 
    value: 'prioritize_features', 
    label: 'Prioriser des fonctionnalités', 
    description: 'Identifier ce qui compte le plus pour les utilisateurs' 
  },
  { 
    value: 'align_decisions', 
    label: 'Aligner des décisions produit', 
    description: 'Créer une référence partagée pour l\'équipe' 
  },
];

export const DETAIL_LEVELS: { value: DetailLevel; label: string }[] = [
  { value: 'synthesis', label: 'Synthèse' },
  { value: 'standard', label: 'Standard' },
  { value: 'detailed', label: 'Détaillé' },
];

export const ORIENTATION_OPTIONS: { value: PersonaOrientation; label: string; description: string }[] = [
  { value: 'needs', label: 'Besoins', description: 'Focus sur les objectifs et motivations' },
  { value: 'frustrations', label: 'Frustrations', description: 'Focus sur les points de douleur' },
  { value: 'decisions', label: 'Décisions', description: 'Focus sur les facteurs de choix' },
];
