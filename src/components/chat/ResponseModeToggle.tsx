import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Minimize2, List, FileText } from 'lucide-react';
import { ResponseMode } from '@/types';

interface ResponseModeToggleProps {
  mode: ResponseMode;
  onChange: (mode: ResponseMode) => void;
}

export const ResponseModeToggle: React.FC<ResponseModeToggleProps> = ({ mode, onChange }) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Mode:</span>
        <ToggleGroup 
          type="single" 
          value={mode} 
          onValueChange={(value) => value && onChange(value as ResponseMode)}
          className="bg-muted/50 rounded-md p-0.5"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem value="short" size="sm" className="data-[state=on]:bg-background px-2 h-7">
                <Minimize2 className="w-3.5 h-3.5" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Court — Réponses concises</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem value="structured" size="sm" className="data-[state=on]:bg-background px-2 h-7">
                <List className="w-3.5 h-3.5" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Structuré — Points clés</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem value="detailed" size="sm" className="data-[state=on]:bg-background px-2 h-7">
                <FileText className="w-3.5 h-3.5" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Détaillé — Exploration complète</p>
            </TooltipContent>
          </Tooltip>
        </ToggleGroup>
      </div>
    </TooltipProvider>
  );
};
