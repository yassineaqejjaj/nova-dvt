import { Agent } from '@/types';

export type AgentRole = 
  | 'product-strategy'
  | 'discovery-research'
  | 'delivery-execution'
  | 'technical-design'
  | 'data-analytics'
  | 'custom';

// Must match Agent['personality'] from types/index.ts
export type DecisionStyle = 'analytical' | 'creative' | 'socratic' | 'balanced';

export interface RoleDefinition {
  id: AgentRole;
  name: string;
  description: string;
  icon: string;
  suggestedMissions: string[];
  suggestedCapabilities: string[];
  familyColor: Agent['familyColor'];
}

export interface CreateAgentFormData {
  role: AgentRole | null;
  customRoleDescription: string;
  name: string;
  useCustomName: boolean;
  mission: string;
  decisionStyle: DecisionStyle;
  capabilities: string[];
}

export interface CreateAgentContext {
  squadId: string | null;
  squadName: string | null;
  contextId: string | null;
  contextName: string | null;
}

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: 'product-strategy',
    name: 'Product Strategy',
    description: 'Aligns vision, prioritizes roadmap, structures decisions',
    icon: 'Target',
    suggestedMissions: [
      'Structure product decisions',
      'Align stakeholders on priorities',
      'Define and refine product vision',
      'Build strategic roadmaps'
    ],
    suggestedCapabilities: [
      'Roadmap structuring',
      'Stakeholder alignment',
      'MVP definition',
      'OKR management',
      'Trade-off analysis'
    ],
    familyColor: 'blue'
  },
  {
    id: 'discovery-research',
    name: 'Discovery & Research',
    description: 'Explores user needs, validates hypotheses, synthesizes insights',
    icon: 'Search',
    suggestedMissions: [
      'Understand user needs deeply',
      'Validate product hypotheses',
      'Synthesize research findings',
      'Map user journeys'
    ],
    suggestedCapabilities: [
      'User interviews',
      'Persona creation',
      'Journey mapping',
      'Insight synthesis',
      'Hypothesis testing'
    ],
    familyColor: 'green'
  },
  {
    id: 'delivery-execution',
    name: 'Delivery & Execution',
    description: 'Translates specs into stories, ensures sprint readiness',
    icon: 'Rocket',
    suggestedMissions: [
      'Translate needs into user stories',
      'Ensure sprint-ready backlog',
      'Coordinate delivery flow',
      'Track execution quality'
    ],
    suggestedCapabilities: [
      'User story writing',
      'Acceptance criteria',
      'Sprint planning',
      'Backlog grooming',
      'Dependency management'
    ],
    familyColor: 'orange'
  },
  {
    id: 'technical-design',
    name: 'Technical Design',
    description: 'Evaluates feasibility, proposes architecture, estimates complexity',
    icon: 'Code',
    suggestedMissions: [
      'Evaluate technical feasibility',
      'Design scalable architecture',
      'Estimate development effort',
      'Identify technical risks'
    ],
    suggestedCapabilities: [
      'Architecture design',
      'Feasibility analysis',
      'Effort estimation',
      'Technical documentation',
      'Risk assessment'
    ],
    familyColor: 'purple'
  },
  {
    id: 'data-analytics',
    name: 'Data & Analytics',
    description: 'Analyzes metrics, challenges with data, measures impact',
    icon: 'BarChart3',
    suggestedMissions: [
      'Challenge assumptions with data',
      'Measure feature impact',
      'Define success metrics',
      'Analyze user behavior'
    ],
    suggestedCapabilities: [
      'KPI definition',
      'Funnel analysis',
      'A/B testing',
      'Data storytelling',
      'Impact measurement'
    ],
    familyColor: 'purple'
  },
  {
    id: 'custom',
    name: 'Custom Role',
    description: 'Define a unique role tailored to your specific needs',
    icon: 'Sparkles',
    suggestedMissions: [],
    suggestedCapabilities: [],
    familyColor: 'blue'
  }
];

export const DECISION_STYLES: Array<{
  id: DecisionStyle;
  name: string;
  description: string;
  behaviorHint: string;
}> = [
  {
    id: 'analytical',
    name: 'Analytique',
    description: 'Prioritizes structure, data, and trade-offs',
    behaviorHint: 'This agent will systematically evaluate options and request data before conclusions.'
  },
  {
    id: 'creative',
    name: 'Créatif',
    description: 'Explores alternatives and unconventional solutions',
    behaviorHint: 'This agent will propose unexpected angles and challenge standard approaches.'
  },
  {
    id: 'socratic',
    name: 'Socratique',
    description: 'Challenges assumptions through questioning',
    behaviorHint: 'This agent will question proposals and surface potential blind spots through probing questions.'
  },
  {
    id: 'balanced',
    name: 'Équilibré',
    description: 'Adapts approach based on context',
    behaviorHint: 'This agent will balance analysis with creativity depending on the situation.'
  }
];
