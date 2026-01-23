import type { FC } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Minimize2, List, FileText } from 'lucide-react';
import { ResponseMode } from '@/types';
import { cn } from '@/lib/utils';

interface ResponseModeToggleProps {
  mode: ResponseMode;
  onChange: (mode: ResponseMode) => void;
  showLabels?: boolean;
}

const modeConfig: Record<ResponseMode, { icon: typeof Minimize2; label: string; description: string }> = {
  short: {
    icon: Minimize2,
    label: 'Court',
    description: '2-3 phrases directes',
  },
  structured: {
    icon: List,
    label: 'Structuré',
    description: 'Bullet points, max 4 points',
  },
  detailed: {
    icon: FileText,
    label: 'Détaillé',
    description: 'Exploration complète avec nuances',
  },
};

export const ResponseModeToggle: FC<ResponseModeToggleProps> = ({ 
  mode, 
  onChange,
  showLabels = false 
}) => {
  return (
    <TooltipProvider>
      <ToggleGroup 
        type="single" 
        value={mode} 
        onValueChange={(value) => value && onChange(value as ResponseMode)}
        className="bg-muted/50 rounded-lg p-0.5 gap-0.5"
      >
        {(Object.keys(modeConfig) as ResponseMode[]).map((modeKey) => {
          const config = modeConfig[modeKey];
          const Icon = config.icon;
          const isActive = mode === modeKey;
          
          return (
            <Tooltip key={modeKey}>
              <TooltipTrigger asChild>
                <ToggleGroupItem 
                  value={modeKey} 
                  size="sm" 
                  className={cn(
                    "px-2.5 h-7 gap-1.5 transition-all",
                    isActive && "bg-background shadow-sm"
                  )}
                >
                  <Icon className={cn(
                    "w-3.5 h-3.5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                  {showLabels && (
                    <span className={cn(
                      "text-xs font-medium transition-colors",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {config.label}
                    </span>
                  )}
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-center">
                <p className="font-medium">{config.label}</p>
                <p className="text-xs text-muted-foreground">{config.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </ToggleGroup>
    </TooltipProvider>
  );
};
