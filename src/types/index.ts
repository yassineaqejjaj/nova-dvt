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

export type TabType = 'dashboard' | 'agents' | 'squads' | 'chat';