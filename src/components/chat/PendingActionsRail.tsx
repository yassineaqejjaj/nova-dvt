import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  X, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Target,
  Map,
  Users,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PendingAction {
  id: string;
  agent_key: string;
  agent_name: string;
  action_type: string;
  action_label: string;
  action_args: Record<string, any>;
  status: 'pending' | 'approved' | 'executed' | 'rejected';
  priority: number;
  created_at: string;
}

interface PendingActionsRailProps {
  actions: PendingAction[];
  onActionExecuted?: (action: PendingAction, result: any) => void;
  onActionRejected?: (action: PendingAction) => void;
  onRefresh?: () => void;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  canvas_generator: <FileText className="h-4 w-4" />,
  story_writer: <FileText className="h-4 w-4" />,
  impact_plotter: <Target className="h-4 w-4" />,
  roadmap_planner: <Map className="h-4 w-4" />,
  user_persona_builder: <Users className="h-4 w-4" />,
};

const ACTION_COLORS: Record<string, string> = {
  canvas_generator: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  story_writer: 'bg-green-500/10 text-green-500 border-green-500/20',
  impact_plotter: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  roadmap_planner: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  user_persona_builder: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
};

export const PendingActionsRail: React.FC<PendingActionsRailProps> = ({
  actions,
  onActionExecuted,
  onActionRejected,
  onRefresh
}) => {
  const [executingId, setExecutingId] = useState<string | null>(null);

  const pendingActions = actions.filter(a => a.status === 'pending');

  const handleApprove = async (action: PendingAction) => {
    setExecutingId(action.id);
    
    try {
      // Update status to approved
      const { error: updateError } = await supabase
        .from('agent_actions')
        .update({ status: 'approved' })
        .eq('id', action.id);

      if (updateError) throw updateError;

      // Execute the action based on type
      let result: any = null;
      
      switch (action.action_type) {
        case 'canvas_generator':
          // Trigger canvas generation
          toast({
            title: "Ouverture du générateur Canvas",
            description: `Contexte: ${action.action_args.context || 'Depuis la discussion'}`,
          });
          // Signal to parent to open the tool
          result = { toolOpened: 'canvas_generator', args: action.action_args };
          break;
          
        case 'story_writer':
          toast({
            title: "Ouverture du Story Writer",
            description: `Feature: ${action.action_args.feature_description || 'Depuis la discussion'}`,
          });
          result = { toolOpened: 'story_writer', args: action.action_args };
          break;
          
        case 'impact_plotter':
          toast({
            title: "Ouverture de l'Impact Plotter",
            description: `${action.action_args.items?.length || 0} éléments à analyser`,
          });
          result = { toolOpened: 'impact_plotter', args: action.action_args };
          break;
          
        case 'roadmap_planner':
          toast({
            title: "Ouverture du Roadmap Planner",
            description: `${action.action_args.features?.length || 0} features à planifier`,
          });
          result = { toolOpened: 'roadmap_planner', args: action.action_args };
          break;
          
        default:
          toast({
            title: "Action approuvée",
            description: action.action_label,
          });
          result = { executed: true };
      }

      // Update to executed
      await supabase
        .from('agent_actions')
        .update({ 
          status: 'executed', 
          executed_at: new Date().toISOString(),
          result 
        })
        .eq('id', action.id);

      onActionExecuted?.(action, result);
      onRefresh?.();

    } catch (error) {
      console.error('Error executing action:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'exécuter l'action",
        variant: "destructive",
      });
    } finally {
      setExecutingId(null);
    }
  };

  const handleReject = async (action: PendingAction) => {
    try {
      await supabase
        .from('agent_actions')
        .update({ status: 'rejected' })
        .eq('id', action.id);

      toast({
        title: "Action rejetée",
        description: action.action_label,
      });

      onActionRejected?.(action);
      onRefresh?.();
    } catch (error) {
      console.error('Error rejecting action:', error);
    }
  };

  if (pendingActions.length === 0) {
    return null;
  }

  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Actions proposées
          <Badge variant="secondary" className="ml-auto">
            {pendingActions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[200px]">
          <div className="space-y-2">
            {pendingActions.map((action) => (
              <div
                key={action.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border transition-colors",
                  ACTION_COLORS[action.action_type] || 'bg-muted/50 border-muted'
                )}
              >
                <div className="flex-shrink-0">
                  {ACTION_ICONS[action.action_type] || <FileText className="h-4 w-4" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {action.action_label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Par {action.agent_name}
                  </p>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 hover:bg-green-500/20 hover:text-green-500"
                    onClick={() => handleApprove(action)}
                    disabled={executingId === action.id}
                  >
                    {executingId === action.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 hover:bg-red-500/20 hover:text-red-500"
                    onClick={() => handleReject(action)}
                    disabled={executingId === action.id}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// Status indicator for orchestration
interface OrchestratorStatusProps {
  isActive: boolean;
  phase: string;
  round: number;
  conductorActive: boolean;
}

export const OrchestratorStatus: React.FC<OrchestratorStatusProps> = ({
  isActive,
  phase,
  round,
  conductorActive
}) => {
  if (!isActive) return null;

  const phaseLabels: Record<string, string> = {
    planning: 'Planification',
    proposal: 'Propositions',
    critique: 'Analyse critique',
    reconciliation: 'Réconciliation',
    complete: 'Terminé'
  };

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-1.5 bg-muted/30 rounded-full">
      {conductorActive && (
        <div className="flex items-center gap-1 text-primary">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-medium">Nova</span>
        </div>
      )}
      <span>•</span>
      <span>Tour {round}</span>
      <span>•</span>
      <span>{phaseLabels[phase] || phase}</span>
    </div>
  );
};

// Agent confidence indicator
interface AgentConfidenceProps {
  agentName: string;
  confidence: number;
  stance?: string;
}

export const AgentConfidence: React.FC<AgentConfidenceProps> = ({
  agentName,
  confidence,
  stance
}) => {
  const confidenceColor = confidence >= 0.7 
    ? 'bg-green-500' 
    : confidence >= 0.4 
      ? 'bg-yellow-500' 
      : 'bg-red-500';

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1">
        <div className={cn("w-2 h-2 rounded-full", confidenceColor)} />
        <span className="text-muted-foreground">
          {Math.round(confidence * 100)}%
        </span>
      </div>
      {stance && (
        <>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground italic truncate max-w-[200px]">
            "{stance}"
          </span>
        </>
      )}
    </div>
  );
};
