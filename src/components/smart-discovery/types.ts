// Smart Discovery Canvas Types

export interface ProductContext {
  id: string;
  name: string;
  vision?: string;
  objectives?: any[];
  target_kpis?: any[];
  target_audience?: string;
  constraints?: string;
  metadata?: {
    industry_sector?: string;
  };
}

export interface DiscoveryData {
  reformulatedProblem: string;
  hypotheses: string[];
  objectives: string[];
  constraints: string[];
  indicators: string[];
}

export interface Persona {
  id: string;
  role: string;
  mainGoal: string;
  keyFrustration: string;
  usageContext: string;
  selected: boolean;
}

export interface JourneyNeed {
  id: string;
  personaId: string;
  situations: string[];
  needs: string[];
  frictionPoints: string[];
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  objective: string;
  expectedValue: string;
  personaId: string;
  personaRole: string;
  indicators: string[];
  selected: boolean;
}

export interface UserStory {
  id: string;
  epicId: string;
  title: string;
  story: {
    asA: string;
    iWant: string;
    soThat: string;
  };
  acceptanceCriteria: string[];
  effortPoints: number;
  tshirtSize: 'XS' | 'S' | 'M' | 'L' | 'XL';
  priority: 'high' | 'medium' | 'low';
  impact: string;
  indicators: string[];
  status: 'draft' | 'validated';
  personaRole: string;
}

export type DiscoveryStep = 'input' | 'discovery' | 'personas' | 'journeys' | 'epics' | 'stories' | 'summary';

export interface DiscoveryState {
  ideaDescription: string;
  reformulatedProblem: string;
  activeContext: ProductContext | null;
  discoveryData: DiscoveryData | null;
  personas: Persona[];
  journeyNeeds: JourneyNeed[];
  epics: Epic[];
  stories: UserStory[];
  currentStep: DiscoveryStep;
}
