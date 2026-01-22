import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PauseCircle, Users2, Scale, ListChecks } from 'lucide-react';
import { SteeringCommand } from '@/types';

interface SteeringControlsProps {
  onCommand: (command: SteeringCommand) => void;
  activeFilters?: string[];
  disabled?: boolean;
}

const COMMANDS: { id: SteeringCommand; label: string; icon: React.ElementType; tooltip: string }[] = [
  { id: 'pause_others', label: 'Pause', icon: PauseCircle, tooltip: 'Mettre les autres agents en pause' },
  { id: 'only_ux_business', label: 'UX + Biz', icon: Users2, tooltip: 'Seuls UX et Business répondent' },
  { id: 'tradeoffs_only', label: 'Trade-offs', icon: Scale, tooltip: 'Afficher uniquement les compromis' },
  { id: 'summarize', label: 'Résumer', icon: ListChecks, tooltip: 'Résumer la discussion' },
];

export const SteeringControls: React.FC<SteeringControlsProps> = ({ 
  onCommand, 
  activeFilters = [],
  disabled = false 
}) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5">
        {COMMANDS.map(({ id, label, icon: Icon, tooltip }) => {
          const isActive = activeFilters.includes(id);
          return (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCommand(id)}
                  disabled={disabled}
                  className="h-7 px-2 text-xs gap-1"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
