export type MissionStep = 'activate' | 'verify' | 'brief';

export interface MissionConfig {
  client: string;
  entity: string;
  country: string;
  missionName: string;
  startDate: string;
  role: 'PM' | 'Design' | 'Dev';
  configuredBy: string;
  associatedContextId?: string;
}

export type ContextInheritance = 'inherit' | 'duplicate' | 'create_new';

export interface AccessCategory {
  id: string;
  label: string;
  checked: boolean;
  tool?: string; // e.g. "Jira", "Confluence"
}

export interface CompletenessScore {
  score: number;
  details: {
    objectivesDefined: boolean;
    kpisDefined: boolean;
    stakeholdersFilled: boolean;
    artefactsCount: number;
    activeWorkflows: number;
  };
}

export interface ConfidenceIndicator {
  level: 'high' | 'medium' | 'low';
  factors: {
    linkedArtefacts: number;
    recentActivity: boolean;
    decisionLogsAvailable: boolean;
  };
}

export interface MissionBrief {
  executiveSummary: {
    vision: string;
    topPriorities: string[];
    primaryRisk: string;
    week1Focus: string;
  };
  structuredBrief: {
    visionObjectives: string;
    scopeIn: string[];
    scopeOut: string[];
    stakeholders: string[];
    raci?: { role: string; responsible: string; accountable: string; consulted: string; informed: string }[];
    timeline: string[];
    risks: { risk: string; mitigation: string }[];
    artefactSummary: string;
    openDecisions: string[];
  };
  plan3060_90: {
    days30: PlanSection;
    days60: PlanSection;
    days90: PlanSection;
  };
}

export interface PlanSection {
  title: string;
  focusAreas: string[];
  kpis: string[];
  suggestedWorkflows: string[];
}

export interface ReplacementAssessment {
  completed: string[];
  inProgress: string[];
  blocked: string[];
  productDebt: string[];
  technicalDebt: string[];
  openDecisions: string[];
  healthIndicator: 'green' | 'yellow' | 'red';
}

// Analytics
export type MissionAnalyticsEvent =
  | 'ONBOARDING_STARTED'
  | 'ONBOARDING_STEP_COMPLETED'
  | 'ONBOARDING_COMPLETED'
  | 'ONBOARDING_ABORTED'
  | 'CONTEXT_REUSED';
