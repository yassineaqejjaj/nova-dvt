import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  FileText, 
  Bookmark, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThreadConclusion as ThreadConclusionType } from '@/types';

interface NextStepRailProps {
  conclusion: ThreadConclusionType | null;
  onAction: (handler: string) => void;
  isLoading?: boolean;
}

const QUICK_ACTIONS = [
  { 
    id: 'save_decision', 
    label: 'Créer décision', 
    icon: CheckCircle2,
    suggested: true 
  },
  { 
    id: 'open_tool:story', 
    label: 'Extraire Epic', 
    icon: FileText,
    suggested: false 
  },
  { 
    id: 'save_reference', 
    label: 'Sauver en référence', 
    icon: Bookmark,
    suggested: false 
  },
];

export const NextStepRail: FC<NextStepRailProps> = ({
  conclusion,
  onAction,
  isLoading = false,
}) => {
  // Determine which action to highlight based on conclusion
  const getSuggestedAction = () => {
    if (!conclusion) return 'save_decision';
    
    switch (conclusion.type) {
      case 'recommendation':
        return 'save_decision';
      case 'options':
        return 'save_decision';
      case 'action':
        return conclusion.actionable?.handler || 'save_decision';
      default:
        return 'save_decision';
    }
  };

  const suggestedAction = getSuggestedAction();

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-4 pb-2 px-3 -mx-3 -mb-3">
      <div className="flex items-center justify-between gap-2 bg-muted/80 backdrop-blur-sm rounded-lg p-2 border shadow-sm">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Prochaine étape</span>
        </div>
        
        <div className="flex items-center gap-2">
          {QUICK_ACTIONS.map(action => {
            const isSuggested = action.id === suggestedAction;
            const Icon = action.icon;
            
            return (
              <Button
                key={action.id}
                variant={isSuggested ? "default" : "ghost"}
                size="sm"
                onClick={() => onAction(action.id)}
                disabled={isLoading}
                className={cn(
                  "h-7 text-xs gap-1.5 transition-all",
                  isSuggested && "shadow-sm"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {action.label}
                {isSuggested && <ArrowRight className="w-3 h-3 ml-0.5" />}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
