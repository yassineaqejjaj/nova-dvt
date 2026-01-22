import type { FC } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { 
  PauseCircle, 
  Users2, 
  Scale, 
  ListChecks,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SteeringCommand } from '@/types';

interface ModeSwitcherProps {
  activeMode: SteeringCommand | null;
  onModeChange: (mode: SteeringCommand | null) => void;
  disabled?: boolean;
}

const MODES: { 
  id: SteeringCommand; 
  label: string; 
  icon: typeof PauseCircle; 
  description: string;
}[] = [
  { 
    id: 'pause_others', 
    label: 'Focus', 
    icon: PauseCircle, 
    description: 'Un seul agent répond à la fois' 
  },
  { 
    id: 'only_ux_business', 
    label: 'UX + Biz', 
    icon: Users2, 
    description: 'Dialogue UX-Business uniquement' 
  },
  { 
    id: 'tradeoffs_only', 
    label: 'Tensions', 
    icon: Scale, 
    description: 'Focus sur les risques et compromis' 
  },
  { 
    id: 'summarize', 
    label: 'Recentrer', 
    icon: ListChecks, 
    description: 'Résumer pour avancer' 
  },
];

export const ModeSwitcher: FC<ModeSwitcherProps> = ({
  activeMode,
  onModeChange,
  disabled = false,
}) => {
  const activeConfig = activeMode ? MODES.find(m => m.id === activeMode) : null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <ToggleGroup 
          type="single" 
          value={activeMode || ''} 
          onValueChange={(value) => onModeChange(value as SteeringCommand || null)}
          className="bg-muted/50 p-0.5 rounded-lg"
        >
          {MODES.map(mode => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            
            return (
              <ToggleGroupItem
                key={mode.id}
                value={mode.id}
                disabled={disabled}
                className={cn(
                  "h-7 px-2.5 text-xs gap-1.5 data-[state=on]:bg-background data-[state=on]:shadow-sm",
                  "transition-all duration-200"
                )}
                aria-label={mode.label}
              >
                <Icon className={cn(
                  "w-3.5 h-3.5",
                  isActive && "text-primary"
                )} />
                <span className="hidden sm:inline">{mode.label}</span>
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
        
        {!activeMode && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Zap className="w-3 h-3" />
            <span className="hidden md:inline">Mode standard</span>
          </div>
        )}
      </div>
      
      {activeConfig && (
        <p className="text-xs text-muted-foreground pl-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {activeConfig.description}
        </p>
      )}
    </div>
  );
};
