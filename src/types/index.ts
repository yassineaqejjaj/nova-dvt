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
  role?: AgentRole; // NEW: Role badge
}

// NEW: Role types for badges
export type AgentRole = 'ux' | 'product' | 'data' | 'tech' | 'business' | 'strategy';

// NEW: Response mode for verbosity control
export type ResponseMode = 'short' | 'structured' | 'detailed';

// NEW: Agent message with stance and reaction type
export interface AgentMessage extends ChatMessage {
  stance?: string; // e.g., "protect human touch first"
  isReaction?: boolean; // micro-input vs full response
  reactionType?: 'agree' | 'disagree' | 'risk' | 'idea';
  isExpanded?: boolean; // for inline expansion
  truncatedContent?: string; // short version
}

// NEW: Live synthesis for side panel
export interface LiveSynthesis {
  options: SynthesisOption[];
  openPoints: string[];
  decisionDraft?: string;
  disagreements: Disagreement[];
  lastUpdated: Date;
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

// NEW: Thread conclusion types
export interface ThreadConclusion {
  type: 'recommendation' | 'options' | 'question' | 'action';
  content: string;
  options?: { label: string; impact: string }[];
  actionable?: { label: string; handler: string };
}

// NEW: Steering commands
export type SteeringCommand = 
  | 'pause_others' 
  | 'only_ux_business' 
  | 'tradeoffs_only' 
  | 'summarize';

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

export type TabType = 'dashboard' | 'agents' | 'squads' | 'chat' | 'workflows' | 'artifacts' | 'analytics' | 'admin' | 'gamification' | 'instant-prd' | 'document-roadmap' | 'reality-mode' | 'meeting-minutes' | 'raci-generator' | 'epic-to-stories' | 'product-context' | 'user-persona-builder' | 'estimation-tool' | 'release-notes-generator' | 'git-to-specs' | 'design-system' | 'smart-discovery';

export interface Artifact {
  id: string;
  user_id: string;
  squad_id?: string;
  artifact_type: 'canvas' | 'story' | 'impact_analysis' | 'epic' | 'tech_spec' | 'roadmap' | 'prd';
  title: string;
  content: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export interface Integration {
  id: string;
  workspace_id: string;
  integration_type: 'jira' | 'slack' | 'figma';
  config: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_data?: any;
  created_at: string;
}
