import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info, X, CheckCircle2 } from 'lucide-react';
import { Framework } from '@/hooks/useFrameworkFilter';
import { cn } from '@/lib/utils';

interface FrameworkFilterProps {
  frameworks: Framework[];
  selectedFrameworks: string[];
  onToggleFramework: (frameworkId: string) => void;
  onClearAll: () => void;
  onSelectAll: () => void;
  className?: string;
}

export function FrameworkFilter({
  frameworks,
  selectedFrameworks,
  onToggleFramework,
  onClearAll,
  onSelectAll,
  className,
}: FrameworkFilterProps) {
  const allSelected = selectedFrameworks.length === frameworks.length;
  const noneSelected = selectedFrameworks.length === 0;

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Frameworks PM</CardTitle>
            <CardDescription className="text-sm mt-1">
              Filtrez par méthodologie de livraison
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {!noneSelected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="h-8 px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {!allSelected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSelectAll}
                className="h-8 px-2"
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {frameworks.map((framework) => {
          const isSelected = selectedFrameworks.includes(framework.id);
          
          return (
            <div
              key={framework.id}
              className={cn(
                "flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer hover:border-primary/50 hover:bg-accent/50",
                isSelected ? "border-primary bg-accent" : "border-border/30"
              )}
              onClick={() => onToggleFramework(framework.id)}
            >
              <Checkbox
                id={framework.id}
                checked={isSelected}
                onCheckedChange={() => onToggleFramework(framework.id)}
                className="mt-0.5"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg leading-none">{framework.emoji}</span>
                  <Label
                    htmlFor={framework.id}
                    className="font-semibold cursor-pointer leading-none"
                  >
                    {framework.name}
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-sm">
                        <div className="space-y-2">
                          <p className="font-semibold text-sm">{framework.description}</p>
                          <p className="text-xs text-muted-foreground italic">
                            {framework.philosophy}
                          </p>
                          <div className="pt-2 border-t border-border/50">
                            <p className="text-xs font-medium mb-1">Idéal pour:</p>
                            <p className="text-xs text-muted-foreground">{framework.best_for}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                            <div>
                              <p className="text-xs font-medium">Équipe:</p>
                              <p className="text-xs text-muted-foreground">{framework.team_size}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium">Cadence:</p>
                              <p className="text-xs text-muted-foreground">{framework.cadence}</p>
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <p className="text-xs text-muted-foreground mb-2">
                  {framework.description}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {framework.tools.slice(0, 3).map((tool) => (
                    <Badge
                      key={tool}
                      variant="secondary"
                      className="text-xs px-1.5 py-0 h-5"
                    >
                      {tool}
                    </Badge>
                  ))}
                  {framework.tools.length > 3 && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0 h-5"
                    >
                      +{framework.tools.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {!noneSelected && (
          <div className="pt-2 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              {selectedFrameworks.length} framework{selectedFrameworks.length > 1 ? 's' : ''} sélectionné{selectedFrameworks.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
