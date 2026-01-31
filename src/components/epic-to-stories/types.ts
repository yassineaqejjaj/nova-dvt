export interface Epic {
  id: string;
  title: string;
  description: string;
  context?: string;
  squadName?: string;
  projectName?: string;
  createdAt?: string;
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
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  technicalNotes?: string;
  status: 'draft' | 'ready' | 'in_progress' | 'done';
  tags: string[];
  risks?: string[];
}

export interface GenerationConfig {
  granularity: 'macro' | 'standard' | 'fine';
  format: 'simple' | 'with_ac' | 'with_ac_risks';
  orientation: 'user_value' | 'technical' | 'balanced';
  focusAreas: string[];
}

export interface ProductContextSummary {
  id: string;
  name: string;
  vision: string | null;
  objectives: string[];
  target_kpis: string[];
  target_audience: string | null;
  industrySector?: string;
}

export type FlowStep = 'source' | 'context' | 'config' | 'generate' | 'finalize';

export interface StoryGenerationResult {
  stories: UserStory[];
  alignmentScore: number;
  objectivesCoverage: number;
}
