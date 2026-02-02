import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Info } from 'lucide-react';
import { CreateAgentContext, AgentRole, ROLE_DEFINITIONS } from './types';

interface StepContextProps {
  role: AgentRole;
  name: string;
  mission: string;
  context: CreateAgentContext;
}

export const StepContext: React.FC<StepContextProps> = ({
  role,
  name,
  mission,
  context
}) => {
  const roleDefinition = ROLE_DEFINITIONS.find(r => r.id === role);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Confirm context</h3>
        <p className="text-sm text-muted-foreground">
          This agent will operate within the following context.
        </p>
      </div>

      {/* Agent Preview */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">{name}</h4>
              <Badge variant="outline" className="mt-1">
                {roleDefinition?.name || 'Custom Role'}
              </Badge>
              {mission && (
                <p className="text-sm text-muted-foreground mt-2">
                  "{mission}"
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context & Squad */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">This agent will operate in:</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Squad */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Squad</span>
              </div>
              {context.squadName ? (
                <p className="text-sm">{context.squadName}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No squad selected
                </p>
              )}
            </CardContent>
          </Card>

          {/* Context */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Product Context</span>
              </div>
              {context.contextName ? (
                <p className="text-sm">{context.contextName}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No context active
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-primary mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">How this agent will work</p>
            <p className="text-muted-foreground mt-1">
              The agent's reasoning will be guided by your product context. 
              It will participate in squad discussions, contribute to decisions, 
              and help produce deliverables aligned with your objectives.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
