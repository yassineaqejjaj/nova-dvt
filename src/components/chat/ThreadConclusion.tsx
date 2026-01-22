import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, HelpCircle, ArrowRight, Lightbulb,
  Scale
} from 'lucide-react';
import { ThreadConclusion as ThreadConclusionType } from '@/types';

interface ThreadConclusionProps {
  conclusion: ThreadConclusionType;
  onActionClick?: (action: string) => void;
}

export const ThreadConclusion: React.FC<ThreadConclusionProps> = ({
  conclusion,
  onActionClick,
}) => {
  const getIcon = () => {
    switch (conclusion.type) {
      case 'recommendation':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'options':
        return <Scale className="w-5 h-5 text-blue-600" />;
      case 'question':
        return <HelpCircle className="w-5 h-5 text-amber-600" />;
      case 'action':
        return <Lightbulb className="w-5 h-5 text-purple-600" />;
    }
  };

  const getLabel = () => {
    switch (conclusion.type) {
      case 'recommendation':
        return 'Recommandation';
      case 'options':
        return 'Options à trancher';
      case 'question':
        return 'Question à résoudre';
      case 'action':
        return 'Action suggérée';
    }
  };

  const getBgClass = () => {
    switch (conclusion.type) {
      case 'recommendation':
        return 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800';
      case 'options':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800';
      case 'question':
        return 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800';
      case 'action':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800';
    }
  };

  return (
    <Card className={`p-4 border-2 ${getBgClass()} mt-4`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <Badge variant="outline" className="mb-2 text-xs">
            {getLabel()}
          </Badge>
          
          <p className="text-sm font-medium mb-3">{conclusion.content}</p>

          {/* Options with impact */}
          {conclusion.type === 'options' && conclusion.options && (
            <div className="space-y-2 mb-3">
              {conclusion.options.map((option, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between bg-background/80 rounded-lg p-2"
                >
                  <span className="text-sm">{option.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    Impact: {option.impact}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Action button */}
          {conclusion.actionable && (
            <Button 
              size="sm"
              onClick={() => onActionClick?.(conclusion.actionable!.handler)}
              className="mt-2"
            >
              {conclusion.actionable.label}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {/* Question requires response */}
          {conclusion.type === 'question' && (
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline">
                Répondre
              </Button>
              <Button size="sm" variant="ghost">
                Plus tard
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
