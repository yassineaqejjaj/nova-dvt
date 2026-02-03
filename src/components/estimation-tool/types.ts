export type EstimationType = 'features' | 'epics' | 'stories' | 'mix';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type ComplexitySize = 'XS' | 'S' | 'M' | 'L' | 'XL';

export interface FeatureInput {
  id: string;
  description: string;
  isEstimable: boolean;
  estimabilityScore: number;
  suggestions?: string[];
  isTooLarge?: boolean;
}

export interface Estimation {
  feature: string;
  complexity: ComplexitySize;
  storyPoints: number;
  hours: { min: number; max: number };
  confidence: string;
  reasoning: string;
  dependencies: string[];
  risks: string[];
  assumptions?: string[];
}

export interface EstimationContext {
  name: string;
  vision: string;
  objectives: string[];
  constraints: string;
  targetAudience: string;
}

export interface EstimationFlowState {
  currentStep: number;
  context: EstimationContext | null;
  estimationType: EstimationType | null;
  features: FeatureInput[];
  rawInput: string;
  estimations: Estimation[];
  confidenceLevel: ConfidenceLevel;
  isAnalyzing: boolean;
  isGenerating: boolean;
}

export const ESTIMATION_TYPES = [
  {
    id: 'features' as EstimationType,
    label: 'Fonctionnalités',
    description: 'Capacités produit de haut niveau',
    icon: 'Layers',
    example: 'Système de paiement, Dashboard analytics'
  },
  {
    id: 'epics' as EstimationType,
    label: 'Epics',
    description: 'Groupes de travail stratégiques',
    icon: 'Target',
    example: 'Onboarding utilisateur, Intégration CRM'
  },
  {
    id: 'stories' as EstimationType,
    label: 'User Stories',
    description: 'Unités de travail sprint-ready',
    icon: 'FileText',
    example: 'En tant que... je veux... afin de...'
  },
  {
    id: 'mix' as EstimationType,
    label: 'Mix',
    description: 'Combinaison de niveaux de granularité',
    icon: 'Shuffle',
    example: 'Différents niveaux de détail'
  }
] as const;

export const COMPLEXITY_CONFIG = {
  XS: { points: '1-2', hours: '<4h', color: 'bg-green-100 text-green-800 border-green-200' },
  S: { points: '3-5', hours: '4-8h', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  M: { points: '8-13', hours: '1-2 jours', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  L: { points: '21-34', hours: '3-5 jours', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  XL: { points: '55+', hours: '>5 jours', color: 'bg-red-100 text-red-800 border-red-200' }
} as const;
