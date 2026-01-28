import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Agent, Squad } from '@/types';
import { 
  Plus, 
  CheckCircle, 
  Users, 
  Zap,
  ChevronRight,
  Sparkles,
  Target
} from 'lucide-react';

interface AgentDetailDialogProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isUnlocked: boolean;
  isInSquad: boolean;
  currentSquad: Squad | null;
  userXP: number;
  onAddToSquad: (agent: Agent) => void;
  onNavigateToSquad?: () => void;
}

// Agent value propositions mapping
const agentValueProps: Record<string, {
  mainValue: string;
  useCases: string[];
  bestWith: string[];
}> = {
  'sarah-pm': {
    mainValue: "Transforme une vision produit en roadmap claire et priorisée",
    useCases: ["Préparer une roadmap trimestrielle", "Cadrer un MVP", "Aligner les parties prenantes"],
    bestWith: ['alex-ux', 'lisa-analytics', 'david-fullstack']
  },
  'alex-ux': {
    mainValue: "Simplifie les parcours complexes en expériences intuitives",
    useCases: ["Auditer un parcours utilisateur", "Prototyper une feature", "Préparer des tests utilisateurs"],
    bestWith: ['sarah-pm', 'maya-ui', 'zoe-frontend']
  },
  'david-fullstack': {
    mainValue: "Traduit les specs produit en architecture technique solide",
    useCases: ["Évaluer la faisabilité technique", "Définir l'architecture", "Estimer les efforts dev"],
    bestWith: ['sarah-pm', 'raj-backend', 'elena-devops']
  },
  'lisa-analytics': {
    mainValue: "Transforme vos données en insights actionnables",
    useCases: ["Analyser un funnel de conversion", "Mesurer l'impact d'une feature", "Identifier des patterns utilisateurs"],
    bestWith: ['sarah-pm', 'experiment-tracker', 'auto-kpi-dashboard']
  },
  'emma-growth': {
    mainValue: "Identifie et active les leviers de croissance produit",
    useCases: ["Optimiser l'acquisition", "Améliorer la rétention", "Créer des loops virales"],
    bestWith: ['lisa-analytics', 'carlos-content', 'kevin-ads']
  },
  // Default for agents without specific mapping
  'default': {
    mainValue: "Apporte son expertise spécialisée à votre équipe",
    useCases: ["Contribuer aux discussions stratégiques", "Apporter un point de vue expert", "Valider les décisions"],
    bestWith: []
  }
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

const getFamilyLabel = (color: string) => {
  switch (color) {
    case 'blue': return 'Product & Strategy';
    case 'green': return 'Design & Workflow';
    case 'purple': return 'Engineering';
    case 'orange': return 'Growth & Analytics';
    default: return 'Spécialiste';
  }
};

export function AgentDetailDialog({
  agent,
  open,
  onOpenChange,
  isUnlocked,
  isInSquad,
  currentSquad,
  userXP,
  onAddToSquad,
  onNavigateToSquad
}: AgentDetailDialogProps) {
  if (!agent) return null;

  const canUnlock = userXP >= agent.xpRequired;
  const xpNeeded = agent.xpRequired - userXP;
  const valueProps = agentValueProps[agent.id] || agentValueProps['default'];

  const getSquadFitMessage = (): { message: string; type: 'positive' | 'neutral' | 'covered' } => {
    if (!currentSquad || currentSquad.agents.length === 0) {
      return { message: "Excellent pour démarrer votre squad", type: 'positive' };
    }

    const squadFamilies = currentSquad.agents.map(a => a.familyColor);
    const familyCount = squadFamilies.filter(f => f === agent.familyColor).length;

    if (familyCount === 0) {
      return { message: "Complète bien votre squad", type: 'positive' };
    } else if (familyCount === 1) {
      return { message: "Renforce une expertise existante", type: 'neutral' };
    } else {
      return { message: "Rôle déjà bien couvert dans votre squad", type: 'covered' };
    }
  };

  const squadFit = getSquadFitMessage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 ring-2 ring-background shadow-lg">
              <AvatarImage src={agent.avatar} />
              <AvatarFallback className={getFamilyColorClass(agent.familyColor)}>
                {agent.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <DialogTitle className="text-xl">{agent.name}</DialogTitle>
              <p className="text-sm text-muted-foreground font-medium">
                {agent.specialty}
              </p>
              <Badge 
                variant="outline" 
                className={`mt-1 text-xs ${getFamilyColorClass(agent.familyColor)} border-0`}
              >
                {getFamilyLabel(agent.familyColor)}
              </Badge>
            </div>

            {agent.xpRequired > 0 && !isUnlocked && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {agent.xpRequired} XP
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Main Value Proposition */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-2">
              <Target className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Ce que cet agent fait pour vous
                </p>
                <p className="font-medium">{valueProps.mainValue}</p>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Cas d'usage typiques
            </p>
            <ul className="space-y-2">
              {valueProps.useCases.map((useCase, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  {useCase}
                </li>
              ))}
            </ul>
          </div>

          {/* Capabilities (hierarchized) */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Capacités principales
            </p>
            <div className="flex flex-wrap gap-2">
              {agent.capabilities.slice(0, 2).map((cap) => (
                <Badge key={cap} variant="secondary">
                  {cap}
                </Badge>
              ))}
              {agent.capabilities.length > 2 && (
                <Badge variant="outline" className="text-muted-foreground">
                  +{agent.capabilities.length - 2} autres
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Squad Fit Signal */}
          <div className={`p-3 rounded-lg border ${
            squadFit.type === 'positive' 
              ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900' 
              : squadFit.type === 'covered'
              ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900'
              : 'bg-muted/50 border-border'
          }`}>
            <div className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${
                squadFit.type === 'positive' ? 'text-green-600' : 
                squadFit.type === 'covered' ? 'text-amber-600' : 'text-muted-foreground'
              }`} />
              <span className="text-sm font-medium">{squadFit.message}</span>
            </div>
            {currentSquad && (
              <p className="text-xs text-muted-foreground mt-1 ml-6">
                Squad actuelle : {currentSquad.name}
              </p>
            )}
          </div>

          {/* Action Section */}
          <div className="flex gap-3">
            {isInSquad ? (
              <>
                <div className="flex-1 p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Déjà dans la squad</span>
                  </div>
                  {currentSquad && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {currentSquad.name}
                    </p>
                  )}
                </div>
                {onNavigateToSquad && (
                  <Button 
                    variant="outline" 
                    onClick={onNavigateToSquad}
                    className="flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Voir la squad
                  </Button>
                )}
              </>
            ) : isUnlocked ? (
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => {
                  onAddToSquad(agent);
                  onOpenChange(false);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter à la squad
              </Button>
            ) : canUnlock ? (
              <Button 
                className="w-full" 
                size="lg"
                variant="outline"
                onClick={() => {
                  onAddToSquad(agent);
                  onOpenChange(false);
                }}
              >
                <Zap className="w-4 h-4 mr-2" />
                Débloquer et ajouter
              </Button>
            ) : (
              <div className="w-full p-3 rounded-lg bg-muted text-center">
                <p className="text-sm font-medium">Agent verrouillé</p>
                <p className="text-xs text-muted-foreground">
                  Encore {xpNeeded} XP nécessaires
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
