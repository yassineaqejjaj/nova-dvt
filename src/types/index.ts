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
}

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
  unlockedAgents: string[];
  badges: Badge[];
  avatar_url?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
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

export type TabType = 'dashboard' | 'agents' | 'squads' | 'chat' | 'workflows' | 'artifacts' | 'analytics' | 'admin' | 'gamification' | 'instant-prd';

export interface Artifact {
  id: string;
  user_id: string;
  squad_id?: string;
  artifact_type: 'canvas' | 'story' | 'impact_analysis' | 'epic' | 'tech_spec';
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