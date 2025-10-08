import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  tool?: 'canvas' | 'story' | 'impact' | 'research' | 'design' | 'code';
  completed?: boolean;
}

interface WorkflowStepsProps {
  steps: WorkflowStep[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
  onToolLaunch?: (tool: string) => void;
  onComplete?: () => void;
}

export const WorkflowSteps: React.FC<WorkflowStepsProps> = ({
  steps,
  currentStep,
  onStepClick,
  onToolLaunch,
  onComplete,
}) => {
  const isStepAccessible = (index: number) => {
    return index <= currentStep || steps[index].completed;
  };

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <Card
          key={step.id}
          className={`transition-all ${
            index === currentStep
              ? 'border-primary shadow-md'
              : step.completed
              ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20'
              : 'opacity-60'
          }`}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {step.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                ) : (
                  <Circle
                    className={`w-6 h-6 mt-1 flex-shrink-0 ${
                      index === currentStep ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">
                      Step {index + 1}: {step.title}
                    </CardTitle>
                    {step.tool && (
                      <Badge variant="outline" className="text-xs">
                        {step.tool}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-1">{step.description}</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          {index === currentStep && (
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {step.tool && onToolLaunch && (
                    <Button onClick={() => onToolLaunch(step.tool!)} size="sm">
                      Launch {step.tool.charAt(0).toUpperCase() + step.tool.slice(1)} Tool
                    </Button>
                  )}
                </div>
                <Button
                  onClick={() => {
                    if (index < steps.length - 1) {
                      onStepClick(index + 1);
                    } else if (onComplete) {
                      onComplete();
                    }
                  }}
                  variant="default"
                  size="sm"
                >
                  {index < steps.length - 1 ? (
                    <>
                      Next Step
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    'Complete Workflow'
                  )}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
