export interface Agent {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  backstory: string;
  capabilities: string[];
  tags: string[];
  xpRequired: number;
  familyColor: 'blue' | 'green' | 'purple' | 'orange';
  personality?: 'balanced' | 'analytical' | 'creative' | 'socratic';
  role?: AgentRole;
}

export type AgentRole = 'ux' | 'product' | 'data' | 'tech' | 'business' | 'strategy';

export type ResponseMode = 'short' | 'structured' | 'detailed';

export interface AgentMessage extends ChatMessage {
  stance?: string;
  isReaction?: boolean;
  reactionType?: 'agree' | 'disagree' | 'risk' | 'idea';
  isExpanded?: boolean;
  truncatedContent?: string;
}

export interface LiveSynthesis {
  options: SynthesisOption[];
  openPoints: string[];
  decisionDraft?: string;
  disagreements: Disagreement[];
  lastUpdated: Date;
  agentInsights?: AgentInsight[];
  conversationMood?: 'exploratory' | 'convergent' | 'divergent' | 'decisive';
}

export interface AgentInsight {
  agentId: string;
  agentName: string;
  specialty: string;
  stance: string;
  contributionCount: number;
  keyArguments: string[];
  bias?: string;
  agreementRate: number;
}

export interface SynthesisOption {
  id: string;
  title: string;
  pros: string[];
  cons: string[];
  supportingAgents: string[];
}

export interface Disagreement {
  id: string;
  agentA: string;
  agentB: string;
  topic: string;
  positionA: string;
  positionB: string;
  resolved?: boolean;
}

export interface ThreadConclusion {
  type: 'recommendation' | 'options' | 'question' | 'action';
  content: string;
  options?: { label: string; impact: string }[];
  actionable?: { label: string; handler: string };
}

export type SteeringCommand = 'pause_others' | 'only_ux_business' | 'tradeoffs_only' | 'summarize';

export interface Squad {
  id: string;
  name: string;
  purpose: string;
  agents: Agent[];
  context?: {
    documents: Document[];
    links: string[];
  };
  createdAt: Date;
  workspace_id?: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  level: number;
  xp: number;
  streak: number;
  coins: number;
  unlockedAgents: string[];
  badges: Badge[];
  avatar_url?: string;
  longestStreak?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category?: string;
  rarity?: string;
}

export interface ChatMessage {
  id: string;
  squadId: string;
  content: string;
  sender: 'user' | Agent;
  timestamp: Date;
  mentionedAgents?: string[];
  attachments?: File[];
}

export type TabType =
  | 'dashboard'
  | 'agents'
  | 'squads'
  | 'chat'
  | 'workflows'
  | 'artifacts'
  | 'analytics'
  | 'admin'
  | 'gamification'
  | 'instant-prd'
  | 'document-roadmap'
  | 'reality-mode'
  | 'meeting-minutes'
  | 'raci-generator'
  | 'epic-to-stories'
  | 'product-context'
  | 'user-persona-builder'
  | 'estimation-tool'
  | 'release-notes-generator'
  | 'git-to-specs'
  | 'design-system'
  | 'smart-discovery'
  | 'toolbox';

// Artifact fields accept null to match Supabase schema
export interface Artifact {
  id: string;
  user_id: string;
  squad_id?: string | null;
  artifact_type: 'canvas' | 'story' | 'impact_analysis' | 'epic' | 'tech_spec' | 'roadmap' | 'prd';
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
  created_at: string | null;
  updated_at: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string | null;
  owner_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: string;
  joined_at: string | null;
}

export interface Integration {
  id: string;
  workspace_id: string;
  integration_type: 'jira' | 'slack' | 'figma';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event_data?: any;
  created_at: string | null;
}
