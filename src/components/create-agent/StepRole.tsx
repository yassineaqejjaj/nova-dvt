import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Target, Search, Rocket, Code, BarChart3, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentRole, ROLE_DEFINITIONS } from './types';

const iconMap = {
  Target,
  Search,
  Rocket,
  Code,
  BarChart3,
  Sparkles
};

interface StepRoleProps {
  selectedRole: AgentRole | null;
  customRoleDescription: string;
  onRoleSelect: (role: AgentRole) => void;
  onCustomDescriptionChange: (description: string) => void;
}

export const StepRole: React.FC<StepRoleProps> = ({
  selectedRole,
  customRoleDescription,
  onRoleSelect,
  onCustomDescriptionChange
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">What is this agent's main role?</h3>
        <p className="text-sm text-muted-foreground">
          This defines how the agent will contribute to your squad's reasoning and decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ROLE_DEFINITIONS.map((role) => {
          const IconComponent = iconMap[role.icon as keyof typeof iconMap];
          const isSelected = selectedRole === role.id;
          
          return (
            <Card
              key={role.id}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50",
                isSelected && "border-primary ring-2 ring-primary/20"
              )}
              onClick={() => onRoleSelect(role.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{role.name}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {role.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedRole === 'custom' && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
          <Label htmlFor="customRole">Describe your custom role</Label>
          <Textarea
            id="customRole"
            placeholder="Describe the specific role this agent should play in your squad..."
            value={customRoleDescription}
            onChange={(e) => onCustomDescriptionChange(e.target.value)}
            rows={3}
          />
        </div>
      )}
    </div>
  );
};
