import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  PanelRightOpen, 
  PanelRightClose,
  Focus,
  Users2,
  Scale,
  ListChecks,
  Minimize2,
  List,
  FileText,
  Zap,
  Plus,
  Loader2
} from 'lucide-react';
import { LiveSynthesis, ResponseMode, SteeringCommand } from '@/types';
import { cn } from '@/lib/utils';

interface ChatControlHeaderProps {
  synthesis: LiveSynthesis;
  messageCount: number;
  activeMode: SteeringCommand | null;
  onModeChange: (mode: SteeringCommand | null) => void;
  responseMode: ResponseMode;
  onResponseModeChange: (mode: ResponseMode) => void;
  showSynthesisPanel: boolean;
  onToggleSynthesisPanel: () => void;
  isLoading: boolean;
  onNewChat: () => void;
  isSavingChat?: boolean;
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

const STATUS_CONFIG: Record<ConversationStatus, { label: string; className: string }> = {
  starting: { label: 'Démarrage', className: 'bg-muted text-muted-foreground' },
  exploring: { label: 'Exploration', className: 'bg-blue-500/15 text-blue-700 dark:text-blue-300' },
  disagreement: { label: 'Divergence', className: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
  converging: { label: 'Convergence', className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
  decision_ready: { label: 'Décision', className: 'bg-primary/15 text-primary' },
};

const STEERING_MODES = [
  { id: 'pause_others' as SteeringCommand, label: 'Focus', icon: Focus, desc: 'Un agent répond' },
  { id: 'only_ux_business' as SteeringCommand, label: 'UX+Biz', icon: Users2, desc: 'Dialogue UX-Business' },
  { id: 'tradeoffs_only' as SteeringCommand, label: 'Tensions', icon: Scale, desc: 'Risques et compromis' },
  { id: 'summarize' as SteeringCommand, label: 'Recentrer', icon: ListChecks, desc: 'Résumer la discussion' },
];

const RESPONSE_MODES = [
  { id: 'short' as ResponseMode, icon: Minimize2, label: 'Court' },
  { id: 'structured' as ResponseMode, icon: List, label: 'Structuré' },
  { id: 'detailed' as ResponseMode, icon: FileText, label: 'Détaillé' },
];

export const ChatControlHeader: FC<ChatControlHeaderProps> = ({
  synthesis,
  messageCount,
  activeMode,
  onModeChange,
  responseMode,
  onResponseModeChange,
  showSynthesisPanel,
  onToggleSynthesisPanel,
  isLoading,
  onNewChat,
  isSavingChat = false,
}) => {
  const status = getConversationStatus(synthesis, messageCount);
  const statusConfig = STATUS_CONFIG[status];

  return (
    <TooltipProvider>
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 py-2.5 flex items-center justify-between gap-4">
          {/* Left: Title + Status + New Chat */}
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-sm">Conversation</h3>
            <Badge 
              variant="secondary" 
              className={cn("text-[10px] font-medium", statusConfig.className)}
            >
              {statusConfig.label}
            </Badge>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNewChat}
                  disabled={isLoading || isSavingChat || messageCount < 2}
                  className="h-7 px-2.5 text-xs gap-1.5"
                >
                  {isSavingChat ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">Nouveau chat</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs max-w-[200px]">
                Sauvegarder la synthèse comme artefact et démarrer une nouvelle conversation
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Center: Steering Modes */}
          <div className="flex items-center gap-2">
            <ToggleGroup 
              type="single" 
              value={activeMode || ''} 
              onValueChange={(value) => onModeChange(value as SteeringCommand || null)}
              className="bg-muted/50 p-0.5 rounded-lg"
            >
              {STEERING_MODES.map(mode => {
                const Icon = mode.icon;
                return (
                  <Tooltip key={mode.id}>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem
                        value={mode.id}
                        disabled={isLoading}
                        className={cn(
                          "h-7 px-2.5 text-xs gap-1.5 data-[state=on]:bg-background data-[state=on]:shadow-sm",
                          "transition-all duration-200"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">{mode.label}</span>
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {mode.desc}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </ToggleGroup>

            {!activeMode && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Zap className="w-3 h-3" />
                <span className="hidden lg:inline">Standard</span>
              </div>
            )}
          </div>

          {/* Right: Response Mode + Panel Toggle */}
          <div className="flex items-center gap-2">
            <ToggleGroup 
              type="single" 
              value={responseMode} 
              onValueChange={(value) => value && onResponseModeChange(value as ResponseMode)}
              className="bg-muted/50 p-0.5 rounded-lg"
            >
              {RESPONSE_MODES.map(mode => {
                const Icon = mode.icon;
                return (
                  <Tooltip key={mode.id}>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem 
                        value={mode.id} 
                        className="data-[state=on]:bg-background px-2 h-7"
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {mode.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </ToggleGroup>

            <div className="w-px h-5 bg-border" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleSynthesisPanel}
                  className="h-7 w-7 p-0"
                >
                  {showSynthesisPanel ? (
                    <PanelRightClose className="w-4 h-4" />
                  ) : (
                    <PanelRightOpen className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {showSynthesisPanel ? 'Masquer synthèse' : 'Afficher synthèse'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
