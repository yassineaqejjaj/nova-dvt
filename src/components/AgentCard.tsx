import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Agent } from '@/types';
import { 
  Plus, 
  Lock, 
  Info, 
  Zap,
  CheckCircle,
  Star
} from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  isUnlocked: boolean;
  isInSquad: boolean;
  userXP: number;
  onAddToSquad: (agent: Agent) => void;
  onViewDetails: (agent: Agent) => void;
}

const getFamilyColorClass = (color: string) => {
  switch (color) {
    case 'blue': return 'bg-agent-blue text-white';
    case 'green': return 'bg-agent-green text-white';
    case 'purple': return 'bg-agent-purple text-white';
    case 'orange': return 'bg-agent-orange text-white';
    default: return 'bg-primary text-white';
  }
};

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  isUnlocked,
  isInSquad,
  userXP,
  onAddToSquad,
  onViewDetails
}) => {
  const canUnlock = userXP >= agent.xpRequired;
  const xpNeeded = agent.xpRequired - userXP;

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
            <p className="text-sm font-medium">Requires {agent.xpRequired} XP</p>
            <p className="text-xs opacity-75">{xpNeeded} XP needed</p>
          </div>
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
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
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-sm truncate">{agent.name}</h3>
                <p className="text-xs text-muted-foreground">{agent.specialty}</p>
              </div>
              {agent.xpRequired > 0 && (
                <Badge 
                  variant="outline" 
                  className="text-xs flex items-center space-x-1"
                >
                  <Zap className="w-3 h-3" />
                  <span>{agent.xpRequired}</span>
                </Badge>
              )}
            </div>

            {/* Top Capabilities */}
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
                  +{agent.capabilities.length - 2} more
                </Badge>
              )}
            </div>

            {/* Backstory Preview */}
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {agent.backstory}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(agent)}
                className="text-xs flex items-center space-x-1 h-7 px-2"
              >
                <Info className="w-3 h-3" />
                <span>Details</span>
              </Button>

              {isUnlocked ? (
                <Button
                  size="sm"
                  onClick={() => onAddToSquad(agent)}
                  disabled={isInSquad}
                  className="text-xs h-7 px-3"
                >
                  {isInSquad ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      In Squad
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3 mr-1" />
                      Add to Squad
                    </>
                  )}
                </Button>
              ) : canUnlock ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddToSquad(agent)}
                  className="text-xs h-7 px-3 border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <Star className="w-3 h-3 mr-1" />
                  Unlock & Add
                </Button>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Locked
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};