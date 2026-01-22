import type { FC } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, HelpCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LiveSynthesis } from '@/types';

interface ConversationStatusPillProps {
  synthesis: LiveSynthesis;
  messageCount: number;
}

type ConversationStatus = 'starting' | 'exploring' | 'disagreement' | 'converging' | 'decision_ready';

const getConversationStatus = (synthesis: LiveSynthesis, messageCount: number): ConversationStatus => {
  if (messageCount < 4) return 'starting';
  
  const unresolvedDisagreements = synthesis.disagreements.filter(d => !d.resolved).length;
  const hasOptions = synthesis.options.length > 0;
  const hasDecisionDraft = !!synthesis.decisionDraft;
  
  if (hasDecisionDraft) return 'decision_ready';
  if (unresolvedDisagreements >= 2) return 'disagreement';
  if (hasOptions && unresolvedDisagreements === 0) return 'converging';
  return 'exploring';
};

const STATUS_CONFIG: Record<ConversationStatus, {
  label: string;
  icon: typeof CheckCircle2;
  className: string;
}> = {
  starting: {
    label: 'Démarrage',
    icon: Sparkles,
    className: 'bg-muted text-muted-foreground border-muted',
  },
  exploring: {
    label: 'Exploration',
    icon: HelpCircle,
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
  },
  disagreement: {
    label: 'Fort désaccord',
    icon: AlertTriangle,
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800',
  },
  converging: {
    label: 'Consensus proche',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
  },
  decision_ready: {
    label: 'Décision prête',
    icon: CheckCircle2,
    className: 'bg-primary/10 text-primary border-primary/30',
  },
};

export const ConversationStatusPill: FC<ConversationStatusPillProps> = ({
  synthesis,
  messageCount,
}) => {
  const status = getConversationStatus(synthesis, messageCount);
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "gap-1 text-xs font-normal transition-all duration-300",
        config.className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};
