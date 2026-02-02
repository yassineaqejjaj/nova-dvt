import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';
import { AgentRole, ROLE_DEFINITIONS } from './types';

interface StepIdentityProps {
  role: AgentRole;
  name: string;
  useCustomName: boolean;
  mission: string;
  onNameChange: (name: string) => void;
  onUseCustomNameChange: (use: boolean) => void;
  onMissionChange: (mission: string) => void;
}

export const StepIdentity: React.FC<StepIdentityProps> = ({
  role,
  name,
  useCustomName,
  mission,
  onNameChange,
  onUseCustomNameChange,
  onMissionChange
}) => {
  const roleDefinition = ROLE_DEFINITIONS.find(r => r.id === role);
  const defaultName = roleDefinition?.name ? `${roleDefinition.name} Agent` : 'Custom Agent';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Define identity & mission</h3>
        <p className="text-sm text-muted-foreground">
          Give your agent a clear identity and primary mission.
        </p>
      </div>

      {/* Agent Name */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="agentName">Agent Name</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Custom name</span>
            <Switch
              checked={useCustomName}
              onCheckedChange={onUseCustomNameChange}
            />
          </div>
        </div>
        
        {useCustomName ? (
          <Input
            id="agentName"
            placeholder="e.g., Sarah Chen, Alex PM..."
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
          />
        ) : (
          <div className="p-3 rounded-lg bg-muted/50 border">
            <span className="font-medium">{defaultName}</span>
            <p className="text-xs text-muted-foreground mt-1">
              Recommended for clarity and consistency
            </p>
          </div>
        )}
      </div>

      {/* Primary Mission */}
      <div className="space-y-3">
        <Label>Primary Mission</Label>
        <p className="text-sm text-muted-foreground -mt-1">
          What is this agent's main purpose? Choose or write your own.
        </p>
        
        {roleDefinition && roleDefinition.suggestedMissions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {roleDefinition.suggestedMissions.map((suggestedMission) => (
              <Badge
                key={suggestedMission}
                variant={mission === suggestedMission ? "default" : "outline"}
                className="cursor-pointer transition-colors hover:bg-primary/10"
                onClick={() => onMissionChange(suggestedMission)}
              >
                {suggestedMission}
              </Badge>
            ))}
          </div>
        )}
        
        <Input
          placeholder="e.g., Translate business needs into actionable user stories"
          value={mission}
          onChange={(e) => onMissionChange(e.target.value)}
        />
      </div>

      {mission && (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-primary mt-0.5" />
          <div className="text-sm">
            <span className="font-medium">This agent will focus on:</span>
            <p className="text-muted-foreground mt-0.5">"{mission}"</p>
          </div>
        </div>
      )}
    </div>
  );
};
