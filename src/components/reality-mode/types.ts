import { Agent } from '@/types';

export type Stance = 'advisor-first' | 'client-first' | 'hybrid' | 'context-dependent';

export interface DebateMessage {
  id: string;
  agent: Agent;
  content: string;
  timestamp: Date;
  isThinking?: boolean;
  stance?: Stance;
  reactions?: { agentId: string; reaction: 'agree' | 'risk' | 'disagree' }[];
  isRealityCheck?: boolean;
  isTensionAgent?: boolean;
}

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  whatChanges: string[];
  whatStaysHuman: string[];
  keyRisk: string;
  suggestedKPIs: string[];
}

export interface DebateOutcome {
  consensus: string[];
  tensions: { left: string; right: string }[];
  nonNegotiables: string[];
  decisionOptions: DecisionOption[];
}

export interface CounterfactualAnalysis {
  chosenOption: string;
  alternativeOption: string;
  advisorLoadImpact: string;
  clientFrictionImpact: string;
  brandRiskImpact: string;
  whatWouldBreakFirst: string[];
}

export interface ConfidenceFactors {
  roleAlignment: number; // 0-100
  unresolvedTensions: number;
  dataVsOpinionRatio: number; // 0-100
  overallConfidence: 'high' | 'medium' | 'low';
  explanation: string;
}

export interface AgentSignal {
  agentId: string;
  agentName: string;
  contributionsCount: number;
  survivedSynthesis: number;
  influencedDecision: number;
  ignoredCount: number;
  wordCountAvg: number;
  signalScore: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  label: 'high_signal' | 'verbose_low_impact' | 'risk_focused' | 'balanced';
}

export interface DecisionLogEntry {
  id?: string;
  debateTopic: string;
  context: string;
  optionsConsidered: DecisionOption[];
  optionChosen?: DecisionOption;
  assumptions: string[];
  kpisToWatch: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
  confidenceFactors: ConfidenceFactors;
  counterfactualAnalysis?: CounterfactualAnalysis;
  debateMessages: DebateMessage[];
  outcome: DebateOutcome;
  tensionsRemaining: { left: string; right: string }[];
  nonNegotiables: string[];
  consensusPoints: string[];
  agentAnalytics: AgentSignal[];
  createdAt?: Date;
}

export interface FrictionPattern {
  id: string;
  tensionSignature: string;
  tensionLeft: string;
  tensionRight: string;
  occurrenceCount: number;
  decisionIds: string[];
  isStructural: boolean;
  resolutionRate: number;
}

export interface UserThinkingStyle {
  optIn: boolean;
  debatesParticipated: number;
  earlyAgreementRate: number;
  riskRaisingRate: number;
  alternativeProposalRate: number;
  synthesisContributionRate: number;
  ideationContributionRate: number;
  strongestImpactArea: 'synthesis' | 'ideation' | 'risks' | 'proposals' | null;
  insights: string[];
}

export interface DecisionValidation {
  id?: string;
  decisionId: string;
  validationType: 'store_feedback' | 'advisor_quote' | 'kpi_snapshot' | 'pilot_result' | 'other';
  title: string;
  content: string;
  attachmentUrl?: string;
  validatesAssumption?: string;
  assumptionStatus: 'validated' | 'invalidated' | 'partial' | 'pending';
  confidenceImpact: 'increases' | 'decreases' | 'neutral';
}

export interface TensionAgent {
  id: string;
  name: string;
  role: 'brand_guardian' | 'store_manager' | 'finance_reality' | 'customer_advocate';
  specialty: string;
  directive: string;
  avatar: string;
}

export const TENSION_AGENTS: TensionAgent[] = [
  {
    id: 'brand-guardian',
    name: 'Gardien de Marque',
    role: 'brand_guardian',
    specialty: 'Protection de marque',
    directive: 'Protège l\'image de marque et l\'exclusivité. Questionne tout ce qui pourrait diluer le positionnement premium.',
    avatar: ''
  },
  {
    id: 'store-manager',
    name: 'Manager Boutique',
    role: 'store_manager',
    specialty: 'Opérations terrain',
    directive: 'Représente la réalité du terrain. Soulève les contraintes opérationnelles et l\'impact sur les équipes.',
    avatar: ''
  },
  {
    id: 'finance-reality',
    name: 'Réalité Financière',
    role: 'finance_reality',
    specialty: 'Viabilité économique',
    directive: 'Questionne la rentabilité et les coûts cachés. Demande des chiffres et des ROI.',
    avatar: ''
  },
  {
    id: 'customer-advocate',
    name: 'Avocat Client',
    role: 'customer_advocate',
    specialty: 'Expérience client',
    directive: 'Défend le point de vue client. Questionne si les décisions servent vraiment l\'utilisateur final.',
    avatar: ''
  }
];

export const STANCE_LABELS: Record<Stance, { label: string; color: string }> = {
  'advisor-first': { label: 'Conseiller d\'abord', color: 'bg-blue-500' },
  'client-first': { label: 'Client d\'abord', color: 'bg-green-500' },
  'hybrid': { label: 'Hybride', color: 'bg-purple-500' },
  'context-dependent': { label: 'Selon contexte', color: 'bg-amber-500' }
};

export const WORD_LIMITS: Record<string, number> = {
  'strategy': 120,
  'product': 120,
  'ux': 100,
  'design': 100,
  'tech': 80,
  'engineering': 80,
  'default': 100
};
