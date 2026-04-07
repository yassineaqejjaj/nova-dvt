import React, { createContext, useContext, useState, useCallback } from 'react';
import { Agent, Squad, UserProfile as UserProfileType, TabType } from '@/types';
import { allAgents } from '@/data/mockData';

// 5 available agents for demo
const DEMO_AGENTS: Agent[] = allAgents.filter(a => 
  ['sarah-pm', 'alex-ux', 'david-fullstack', 'lisa-analytics', 'emma-qa'].includes(a.id)
).map(a => ({ ...a, xpRequired: 0 }));

// Fallback if some IDs don't match
const getDemoAgents = (): Agent[] => {
  if (DEMO_AGENTS.length >= 5) return DEMO_AGENTS.slice(0, 5);
  return allAgents.slice(0, 5).map(a => ({ ...a, xpRequired: 0 }));
};

// Allowed tabs in demo
const DEMO_TABS: TabType[] = [
  'dashboard', 'agents', 'squads', 'chat', 'workflows', 'toolbox', 'artifacts', 'instant-prd', 'epic-to-stories', 'product-context'
];

interface DemoProductContext {
  name: string;
  vision: string;
  audience: string;
  objective: string;
}

interface DemoContextType {
  isDemo: boolean;
  demoAgents: Agent[];
  demoSquad: Squad | null;
  demoProfile: UserProfileType;
  demoSquads: Squad[];
  allowedTabs: TabType[];
  canCreateSquad: boolean;
  addAgentToSquad: (agent: Agent) => boolean;
  removeAgentFromSquad: (agentId: string) => void;
  createSquad: (name: string) => boolean;
  isTabAllowed: (tab: TabType) => boolean;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  guidedSteps: GuidedStep[];
  demoProductContext: DemoProductContext | null;
  setDemoProductContext: (ctx: DemoProductContext) => void;
  hasContext: boolean;
}

interface GuidedStep {
  id: string;
  title: string;
  description: string;
  targetTab: TabType;
  completed: boolean;
}

const DemoContext = createContext<DemoContextType | null>(null);

export const useDemo = () => {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
};

export const useMaybeDemo = () => useContext(DemoContext);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const agents = getDemoAgents();
  const [squadAgents, setSquadAgents] = useState<Agent[]>([agents[0], agents[1]]);
  const [hasCreatedSquad, setHasCreatedSquad] = useState(true);
  const [squadName, setSquadName] = useState('Discovery Squad');
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [demoProductContext, setDemoProductContext] = useState<DemoProductContext | null>(null);

  const demoProfile: UserProfileType = {
    id: 'demo-user',
    name: 'Demo User',
    role: 'Product Manager',
    level: 3,
    xp: 450,
    streak: 5,
    avatar_url: '',
    unlockedAgents: agents.map(a => a.id),
    coins: 0,
    badges: [{ id: 'demo', name: 'Explorer', description: 'Demo mode', icon: '🧭', unlockedAt: new Date() }],
  };

  const demoSquad: Squad = {
    id: 'demo-squad',
    name: squadName,
    purpose: 'Guided demo squad',
    agents: squadAgents,
    createdAt: new Date(),
  };

  const guidedSteps: GuidedStep[] = [
    { id: 'create-context', title: 'Définir le contexte', description: 'Créez le contexte produit qui alimentera tous les agents et workflows.', targetTab: 'product-context', completed: completedSteps.has('create-context') },
    { id: 'explore-tools', title: 'Découvrir les outils', description: 'Explorez la boîte à outils avec des outils IA prêts à l\'emploi.', targetTab: 'toolbox', completed: completedSteps.has('explore-tools') },
    { id: 'try-workflow', title: 'Lancer un workflow', description: 'Essayez le workflow Instant PRD pour générer un document produit.', targetTab: 'instant-prd', completed: completedSteps.has('try-workflow') },
    { id: 'view-artifacts', title: 'Voir les artefacts', description: 'Consultez les livrables structurés générés par Nova.', targetTab: 'artifacts', completed: completedSteps.has('view-artifacts') },
    { id: 'manage-squad', title: 'Créer une squad', description: 'Ajoutez ou retirez des agents de votre squad.', targetTab: 'squads', completed: completedSteps.has('manage-squad') },
    { id: 'browse-agents', title: 'Explorer les agents', description: 'Découvrez les agents IA disponibles et leurs spécialités.', targetTab: 'agents', completed: completedSteps.has('browse-agents') },
    { id: 'multi-agent-chat', title: 'Chat multi-agents', description: 'Démarrez une conversation avec votre squad.', targetTab: 'chat', completed: completedSteps.has('multi-agent-chat') },
  ];

  const addAgentToSquad = useCallback((agent: Agent) => {
    if (squadAgents.length >= 5) return false;
    if (squadAgents.some(a => a.id === agent.id)) return false;
    setSquadAgents(prev => [...prev, agent]);
    return true;
  }, [squadAgents]);

  const removeAgentFromSquad = useCallback((agentId: string) => {
    setSquadAgents(prev => prev.filter(a => a.id !== agentId));
  }, []);

  const createSquad = useCallback((name: string) => {
    if (hasCreatedSquad) return false;
    setSquadName(name);
    setHasCreatedSquad(true);
    return true;
  }, [hasCreatedSquad]);

  const isTabAllowed = useCallback((tab: TabType) => DEMO_TABS.includes(tab), []);

  const handleSetStep = useCallback((step: number) => {
    setCurrentStep(step);
    if (step > 0 && step <= guidedSteps.length) {
      setCompletedSteps(prev => new Set([...prev, guidedSteps[step - 1].id]));
    }
  }, [guidedSteps]);

  return (
    <DemoContext.Provider value={{
      isDemo: true,
      demoAgents: agents,
      demoSquad,
      demoProfile,
      demoSquads: [demoSquad],
      allowedTabs: DEMO_TABS,
      canCreateSquad: !hasCreatedSquad,
      addAgentToSquad,
      removeAgentFromSquad,
      createSquad,
      isTabAllowed,
      currentStep,
      setCurrentStep: handleSetStep,
      guidedSteps,
      demoProductContext,
      setDemoProductContext,
      hasContext: !!demoProductContext,
    }}>
      {children}
    </DemoContext.Provider>
  );
};
