import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Agent, Squad } from '@/types';
import { 
  Plus, 
  Lock, 
  Zap,
  CheckCircle,
  Star,
  ChevronRight,
  Users
} from 'lucide-react';

interface AgentCardCompactProps {
  agent: Agent;
  isUnlocked: boolean;
  isInSquad: boolean;
  squadName?: string;
  userXP: number;
  onAddToSquad: (agent: Agent) => void;
  onViewDetails: (agent: Agent) => void;
}

// Quick value proposition for each agent
const agentQuickValue: Record<string, string> = {
  'sarah-pm': 'Cadrer une roadmap',
  'alex-ux': 'Simplifier un parcours',
  'david-fullstack': 'Évaluer la faisabilité',
  'lisa-analytics': 'Analyser des comportements',
  'emma-growth': 'Booster la croissance',
  'marcus-scrum': 'Coordonner les sprints',
  'maya-ui': 'Designer des interfaces',
  'zoe-frontend': 'Optimiser les performances',
  'raj-backend': 'Architecturer le backend',
  'elena-devops': 'Automatiser les déploiements',
  'carlos-content': 'Créer du contenu engageant',
  'story-writer': 'Rédiger des user stories',
  'refinement-assistant': 'Découper les epics',
  'roadmap-visualizer': 'Visualiser la roadmap',
  'market-scanner': 'Analyser la concurrence',
  'user-insight': 'Synthétiser les interviews',
  'impact-effort-plotter': 'Prioriser le backlog',
  'scenario-simulator': 'Simuler des scénarios',
  'auto-kpi-dashboard': 'Suivre les KPIs',
  'experiment-tracker': 'Analyser les A/B tests',
  'brief-generator': 'Générer des briefs',
  'meeting-summarizer': 'Résumer les réunions',
};

const getFamilyColorClass = (color: string) => {
  switch (color) {
    case 'blue': return 'bg-agent-blue text-white';
    case 'green': return 'bg-agent-green text-white';
    case 'purple': return 'bg-agent-purple text-white';
    case 'orange': return 'bg-agent-orange text-white';
    default: return 'bg-primary text-white';
  }
};

export function AgentCardCompact({
  agent,
  isUnlocked,
  isInSquad,
  squadName,
  userXP,
  onAddToSquad,
  onViewDetails
}: AgentCardCompactProps) {
  const canUnlock = userXP >= agent.xpRequired;
  const xpNeeded = agent.xpRequired - userXP;
  const quickValue = agentQuickValue[agent.id] || agent.specialty;

  return (
    <Card className={`
      group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1
      ${isUnlocked ? 'card-glow' : 'opacity-75'}
      ${!canUnlock && !isUnlocked ? 'grayscale' : ''}
    `}>
      {/* Family Color Accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${getFamilyColorClass(agent.familyColor)}`} />
      
      {/* Lock Overlay for Locked Agents */}
      {!isUnlocked && !canUnlock && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center text-white">
            <Lock className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Requiert {agent.xpRequired} XP</p>
            <p className="text-xs opacity-75">{xpNeeded} XP manquants</p>
          </div>
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="w-12 h-12 ring-2 ring-background shadow-md">
              <AvatarImage src={agent.avatar} />
              <AvatarFallback className={getFamilyColorClass(agent.familyColor)}>
                {agent.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {isUnlocked && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Agent Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="font-semibold text-sm truncate">{agent.name}</h3>
                <p className="text-xs text-muted-foreground">{agent.specialty}</p>
              </div>
              {agent.xpRequired > 0 && !isUnlocked && (
                <Badge 
                  variant="outline" 
                  className="text-xs flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  <span>{agent.xpRequired}</span>
                </Badge>
              )}
            </div>

            {/* Quick Value Proposition */}
            <p className="text-xs text-primary font-medium mb-2">
              Aide à : {quickValue}
            </p>

            {/* Top 2 Capabilities */}
            <div className="flex flex-wrap gap-1 mb-3">
              {agent.capabilities.slice(0, 2).map((capability) => (
                <Badge 
                  key={capability} 
                  variant="secondary" 
                  className="text-xs"
                >
                  {capability}
                </Badge>
              ))}
              {agent.capabilities.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{agent.capabilities.length - 2}
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(agent)}
                className="text-xs h-7 px-2"
              >
                Détails
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>

              {isInSquad ? (
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {squadName || 'Dans la squad'}
                </Badge>
              ) : isUnlocked ? (
                <Button
                  size="sm"
                  onClick={() => onAddToSquad(agent)}
                  className="text-xs h-7 px-3"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Ajouter
                </Button>
              ) : canUnlock ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddToSquad(agent)}
                  className="text-xs h-7 px-3 border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <Star className="w-3 h-3 mr-1" />
                  Débloquer
                </Button>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Verrouillé
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
