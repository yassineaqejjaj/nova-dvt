import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock, ArrowRight, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecommendedWorkflowsProps {
  workflows: Array<{
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    estimatedTime: string;
    expectedOutput: string;
  }>;
  contextName: string | null;
  onSelect: (workflowId: string) => void;
}

export function RecommendedWorkflows({ 
  workflows, 
  contextName, 
  onSelect 
}: RecommendedWorkflowsProps) {
  if (workflows.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h3 className="font-semibold text-sm">
          Recommandé pour vous
          {contextName && (
            <span className="text-muted-foreground font-normal ml-1">
              (contexte: {contextName})
            </span>
          )}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {workflows.slice(0, 3).map((workflow) => (
          <Card
            key={workflow.id}
            className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => onSelect(workflow.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600">
                    {workflow.icon}
                  </div>
                  <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Recommandé
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-sm mt-2">{workflow.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <CardDescription className="text-xs line-clamp-2">
                {workflow.description}
              </CardDescription>
              
              <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 rounded-md px-2 py-1">
                <Target className="w-3 h-3" />
                <span className="font-medium">Résultat:</span>
                <span>{workflow.expectedOutput}</span>
              </div>
              
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {workflow.estimatedTime}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs group-hover:text-primary"
                >
                  Démarrer
                  <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
