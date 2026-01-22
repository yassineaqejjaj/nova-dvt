import type { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  GitBranch, 
  HelpCircle, 
  Zap,
  ChevronRight,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { ThreadConclusion as ThreadConclusionType } from '@/types';
import { cn } from '@/lib/utils';

interface ThreadConclusionProps {
  conclusion: ThreadConclusionType;
  onActionClick?: (action: string) => void;
}

const TYPE_CONFIG: Record<ThreadConclusionType['type'], {
  icon: typeof Lightbulb;
  label: string;
  bgClass: string;
  borderClass: string;
}> = {
  recommendation: {
    icon: Lightbulb,
    label: 'Ce que ça suggère',
    bgClass: 'bg-emerald-50/80 dark:bg-emerald-950/30',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
  },
  options: {
    icon: GitBranch,
    label: 'Les chemins possibles',
    bgClass: 'bg-blue-50/80 dark:bg-blue-950/30',
    borderClass: 'border-blue-200 dark:border-blue-800',
  },
  question: {
    icon: HelpCircle,
    label: 'La question qui bloque',
    bgClass: 'bg-amber-50/80 dark:bg-amber-950/30',
    borderClass: 'border-amber-200 dark:border-amber-800',
  },
  action: {
    icon: Zap,
    label: 'L\'action à lancer',
    bgClass: 'bg-primary/10',
    borderClass: 'border-primary/30',
  },
};

export const ThreadConclusion: FC<ThreadConclusionProps> = ({
  conclusion,
  onActionClick,
}) => {
  const config = TYPE_CONFIG[conclusion.type];
  const Icon = config.icon;

  // Parse content if it's JSON-like
  const getDisplayContent = () => {
    try {
      const cleaned = conclusion.content.replace(/```json\s*/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return parsed.content || conclusion.content;
    } catch {
      return conclusion.content;
    }
  };

  return (
    <Card className={cn(
      "my-4 border-2",
      config.bgClass,
      config.borderClass
    )}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className={cn(
            "p-1.5 rounded-md",
            conclusion.type === 'recommendation' && "bg-emerald-100 dark:bg-emerald-900/50",
            conclusion.type === 'options' && "bg-blue-100 dark:bg-blue-900/50",
            conclusion.type === 'question' && "bg-amber-100 dark:bg-amber-900/50",
            conclusion.type === 'action' && "bg-primary/20"
          )}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold">{config.label}</span>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed mb-4">
          {getDisplayContent()}
        </p>

        {/* Options rendering */}
        {conclusion.options && conclusion.options.length > 0 && (
          <div className="space-y-2 mb-4">
            {conclusion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => onActionClick?.(`selectOption:${idx}:${option.label}`)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all",
                  "hover:border-primary/50 hover:bg-background/80",
                  "bg-white/60 dark:bg-background/40 border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{option.label}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Impact: {option.impact}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Action buttons - improved microcopy */}
        <div className="flex items-center gap-2">
          {conclusion.actionable ? (
            <Button
              onClick={() => onActionClick?.(conclusion.actionable!.handler)}
              className="h-8 text-sm gap-1.5"
            >
              {conclusion.actionable.label}
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          ) : conclusion.type === 'question' ? (
            <>
              <Button
                variant="default"
                onClick={() => onActionClick?.('answer_question')}
                className="h-8 text-sm gap-1.5"
              >
                Répondre maintenant
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => onActionClick?.('defer_question')}
                className="h-8 text-sm"
              >
                Plus tard
              </Button>
            </>
          ) : (
            <Button
              onClick={() => onActionClick?.('save_decision')}
              className="h-8 text-sm gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ancrer cette décision
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};