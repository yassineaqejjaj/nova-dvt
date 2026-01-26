import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  ChevronRight, 
  Target, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowCardProps {
  workflow: {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    estimatedTime: string;
    difficulty: string;
    tags: string[];
    steps: Array<{ id: string; title: string }>;
    frameworks?: string[];
  };
  expectedOutput: string;
  isCompatibleWithFramework: boolean;
  selectedFrameworks: string[];
  compatibleFrameworkNames: string[];
  usageCount?: number;
  onSelect: () => void;
}

export function WorkflowCard({
  workflow,
  expectedOutput,
  isCompatibleWithFramework,
  selectedFrameworks,
  compatibleFrameworkNames,
  usageCount,
  onSelect,
}: WorkflowCardProps) {
  const [showAllTags, setShowAllTags] = useState(false);
  
  const mainTags = workflow.tags.slice(0, 2);
  const secondaryTags = workflow.tags.slice(2);
  const hasSecondaryTags = secondaryTags.length > 0;
  
  const isGreyedOut = selectedFrameworks.length > 0 && !isCompatibleWithFramework;

  return (
    <Card
      className={cn(
        "transition-all duration-200 cursor-pointer group relative",
        isGreyedOut 
          ? "opacity-50 grayscale hover:opacity-70" 
          : "hover:shadow-lg hover:border-primary/30"
      )}
      onClick={onSelect}
    >
      {/* Framework compatibility badge */}
      {selectedFrameworks.length > 0 && isCompatibleWithFramework && compatibleFrameworkNames.length > 0 && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="text-xs bg-emerald-500 hover:bg-emerald-600 shadow-sm">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {compatibleFrameworkNames[0]}
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            {workflow.icon}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm leading-tight">{workflow.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                <Clock className="w-3 h-3 mr-1" />
                {workflow.estimatedTime}
              </Badge>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs px-1.5 py-0",
                  workflow.difficulty === 'Beginner' && "bg-emerald-100 text-emerald-700",
                  workflow.difficulty === 'Intermediate' && "bg-amber-100 text-amber-700",
                  workflow.difficulty === 'Advanced' && "bg-rose-100 text-rose-700"
                )}
              >
                {workflow.difficulty}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <CardDescription className="text-xs line-clamp-2">
          {workflow.description}
        </CardDescription>
        
        {/* Expected output - key addition */}
        <div className="bg-muted/50 rounded-md p-2 border border-border/50">
          <div className="flex items-start gap-1.5">
            <Target className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-medium text-foreground">À la fin, vous obtenez:</span>
              <p className="text-xs text-muted-foreground">{expectedOutput}</p>
            </div>
          </div>
        </div>
        
        {/* Usage count in context */}
        {usageCount !== undefined && usageCount > 0 && (
          <div className="text-xs text-muted-foreground italic">
            Utilisé {usageCount} fois dans ce contexte
          </div>
        )}
        
        {/* Two-tier tags */}
        <div className="space-y-1">
          <div className="flex flex-wrap gap-1 items-center">
            {mainTags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                {tag}
              </Badge>
            ))}
            {hasSecondaryTags && !showAllTags && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllTags(true);
                }}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 px-1"
              >
                +{secondaryTags.length}
                <ChevronDown className="w-3 h-3" />
              </button>
            )}
            {hasSecondaryTags && showAllTags && (
              <>
                {secondaryTags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0 bg-muted/50">
                    {tag}
                  </Badge>
                ))}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllTags(false);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 px-1"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">
            {workflow.steps.length} étapes
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs group-hover:text-primary"
          >
            Démarrer
            <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
