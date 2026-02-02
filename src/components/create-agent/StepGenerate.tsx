import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { Agent } from '@/types';
import { CreateAgentFormData, ROLE_DEFINITIONS, DECISION_STYLES } from './types';

interface StepGenerateProps {
  formData: CreateAgentFormData;
  isGenerating: boolean;
  generatedAgent: Agent | null;
  onGenerate: () => void;
  onRegenerate: () => void;
}

export const StepGenerate: React.FC<StepGenerateProps> = ({
  formData,
  isGenerating,
  generatedAgent,
  onGenerate,
  onRegenerate
}) => {
  const roleDefinition = ROLE_DEFINITIONS.find(r => r.id === formData.role);
  const decisionStyle = DECISION_STYLES.find(s => s.id === formData.decisionStyle);

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <Loader2 className="w-6 h-6 text-primary absolute -bottom-1 -right-1 animate-spin" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold">Generating your agent...</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Creating backstory and refining capabilities
          </p>
        </div>
      </div>
    );
  }

  if (generatedAgent) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold">Agent Created!</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your agent is ready to join your squad.
          </p>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-primary">
                  {generatedAgent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-lg">{generatedAgent.name}</h4>
                <p className="text-sm text-muted-foreground">{generatedAgent.specialty}</p>
                
                {generatedAgent.backstory && (
                  <p className="text-sm mt-3 text-muted-foreground italic">
                    "{generatedAgent.backstory}"
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  {generatedAgent.tags?.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          onClick={onRegenerate}
          className="w-full"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Regenerate with different style
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Ready to generate</h3>
        <p className="text-sm text-muted-foreground">
          Nova will create a unique agent based on your configuration.
        </p>
      </div>

      {/* Configuration Summary */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Role</span>
            <Badge variant="outline">{roleDefinition?.name || 'Custom'}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="font-medium">{formData.name}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Decision Style</span>
            <Badge variant="secondary">{decisionStyle?.name}</Badge>
          </div>
          
          <div>
            <span className="text-sm text-muted-foreground">Mission</span>
            <p className="text-sm mt-1">{formData.mission}</p>
          </div>
          
          <div>
            <span className="text-sm text-muted-foreground">Capabilities</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {formData.capabilities.map((cap) => (
                <Badge key={cap} variant="outline" className="text-xs">
                  {cap}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={onGenerate}
        className="w-full"
        size="lg"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Generate Agent
      </Button>
    </div>
  );
};
