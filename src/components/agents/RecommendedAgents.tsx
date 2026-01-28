import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Agent, Squad } from '@/types';
import { Sparkles, Plus, CheckCircle, Users } from 'lucide-react';

interface RecommendedAgentsProps {
  agents: Agent[];
  currentSquad: Squad | null;
  contextName?: string;
  onAddToSquad: (agent: Agent) => void;
  onViewDetails: (agent: Agent) => void;
}

export function RecommendedAgents({
  agents,
  currentSquad,
  contextName,
  onAddToSquad,
  onViewDetails
}: RecommendedAgentsProps) {
  // Get recommended agents based on squad composition
  const getRecommendedAgents = (): Agent[] => {
    if (!currentSquad) return agents.slice(0, 3);
    
    const squadAgentIds = currentSquad.agents.map(a => a.id);
    const squadRoles = currentSquad.agents.map(a => a.familyColor);
    
    // Find agents that complement the squad
    const recommended = agents.filter(agent => {
      // Not already in squad
      if (squadAgentIds.includes(agent.id)) return false;
      
      // Prefer agents from underrepresented families
      const roleCount = squadRoles.filter(r => r === agent.familyColor).length;
      return roleCount < 2;
    });
    
    return recommended.slice(0, 3);
  };

  const recommendedAgents = getRecommendedAgents();

  if (recommendedAgents.length === 0) return null;

  const getFamilyColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-agent-blue';
      case 'green': return 'bg-agent-green';
      case 'purple': return 'bg-agent-purple';
      case 'orange': return 'bg-agent-orange';
      default: return 'bg-primary';
    }
  };

  const getComplementMessage = (agent: Agent): string => {
    if (!currentSquad || currentSquad.agents.length === 0) {
      return "Excellent pour démarrer";
    }
    
    const squadFamilies = currentSquad.agents.map(a => a.familyColor);
    const hasFamily = squadFamilies.includes(agent.familyColor);
    
    if (!hasFamily) {
      switch (agent.familyColor) {
        case 'blue': return "Ajoute la vision produit";
        case 'green': return "Ajoute l'expertise design";
        case 'purple': return "Ajoute la perspective tech";
        case 'orange': return "Ajoute le focus croissance";
        default: return "Complète votre squad";
      }
    }
    
    return "Renforce votre équipe";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium">
          Recommandés pour {contextName ? `"${contextName}"` : 'vous'}
        </h3>
        {currentSquad && (
          <Badge variant="outline" className="text-xs">
            <Users className="w-3 h-3 mr-1" />
            {currentSquad.name}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {recommendedAgents.map((agent) => {
          const isInSquad = currentSquad?.agents.some(a => a.id === agent.id);
          
          return (
            <Card 
              key={agent.id} 
              className="relative overflow-hidden border-primary/20 bg-primary/5"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 ${getFamilyColorClass(agent.familyColor)}`} />
              
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={agent.avatar} />
                    <AvatarFallback className={getFamilyColorClass(agent.familyColor) + ' text-white text-xs'}>
                      {agent.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{agent.name}</h4>
                    <p className="text-xs text-muted-foreground">{agent.specialty}</p>
                    
                    <p className="text-xs text-primary mt-1 font-medium">
                      {getComplementMessage(agent)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(agent)}
                    className="flex-1 text-xs h-8"
                  >
                    Détails
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onAddToSquad(agent)}
                    disabled={isInSquad}
                    className="flex-1 text-xs h-8"
                  >
                    {isInSquad ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Dans la squad
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3 mr-1" />
                        Ajouter
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
