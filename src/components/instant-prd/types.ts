 // Types for InstantPRD stepper workflow
 
 export type FlowStep = 'context' | 'config' | 'generate' | 'preview' | 'finalize';
 
 export interface PRDSection {
   id: string;
   title: string;
   icon: string;
   status: 'pending' | 'generating' | 'complete';
   content?: any;
 }
 
export interface Persona {
  name: string;
  role: string;
  age: number;
  bio?: string;
  goals: string[];
  painPoints: string[];
  motivations?: string[];
  behaviors?: string[];
  quote?: string;
  imageUrl?: string;
}
 
export interface Feature {
  id: string;
  name: string;
  description: string;
  businessValue?: string;
  scope?: string;
  dependencies?: string[];
  userStories?: UserStory[];
}
 
export interface UserStory {
  id: string;
  featureId: string;
  title: string;
  asA?: string;
  iWant?: string;
  soThat?: string;
  description?: string;
  acceptanceCriteria: string[];
  priority: 'high' | 'medium' | 'low';
  complexity: 'XS' | 'S' | 'M' | 'L' | 'XL';
  storyPoints?: number;
  technicalNotes?: string;
}
 
 export interface JourneyStage {
   stage: string;
   actions: string[];
   thoughts: string[];
   painPoints: string[];
   opportunities: string[];
 }
 
 export interface PRDDocument {
   introduction: string;
   context: string;
   problem: string;
   vision: string;
   constraints: string[];
   personas: Persona[];
   userJourneyMap: JourneyStage[];
   features: Feature[];
   prioritization: { mvp: string[]; must: string[]; should: string[]; could: string[]; wont: string[] };
   acceptance: string[];
   wireframes: string[];
   architecture: any;
   risks: { risk: string; mitigation: string; dependencies?: string }[];
   kpis: string[];
   roadmap: { phase: string; timeline: string; deliverables: string[] }[];
   appendix: string[];
 }
 
 export interface Artifact {
   id: string;
   title: string;
   artifact_type: string;
   content: any;
   created_at: string;
 }
 
 export interface ProductContextSummary {
   id: string;
   name: string;
   vision?: string;
   objectives?: string[];
   target_audience?: string;
   constraints?: string;
 }
 
 export interface PRDConfig {
   includePersonas: boolean;
   includeJourneyMap: boolean;
   includeUserStories: boolean;
   detailLevel: 'concise' | 'standard' | 'detailed';
 }