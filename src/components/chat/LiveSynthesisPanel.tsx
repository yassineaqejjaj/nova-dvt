import type { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, HelpCircle, AlertTriangle, 
  ChevronRight, Handshake, RefreshCw, Lightbulb, Target,
  Brain, Users, TrendingUp, Sparkles, Eye, MessageSquare
} from 'lucide-react';
import { LiveSynthesis, Disagreement, AgentInsight } from '@/types';
import { cn } from '@/lib/utils';
import { inferRoleFromSpecialty } from './RoleBadge';

interface LiveSynthesisPanelProps {
  synthesis: LiveSynthesis;
  onResolveDisagreement: (disagreementId: string) => void;
}

const MOOD_CONFIG = {
  exploratory: { label: 'Exploration', color: 'bg-blue-500', icon: Eye },
  convergent: { label: 'Convergence', color: 'bg-emerald-500', icon: TrendingUp },
  divergent: { label: 'Divergence', color: 'bg-amber-500', icon: AlertTriangle },
  decisive: { label: 'Décision proche', color: 'bg-primary', icon: Target },
};

const ROLE_COLORS: Record<string, string> = {
  ux: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30',
  product: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30',
  tech: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30',
  business: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30',
  data: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
  strategy: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30',
};

export const LiveSynthesisPanel: FC<LiveSynthesisPanelProps> = ({
  synthesis,
  onResolveDisagreement,
}) => {
  const hasContent = synthesis.options.length > 0 || 
                     synthesis.openPoints.length > 0 || 
                     synthesis.disagreements.length > 0 ||
                     (synthesis.agentInsights && synthesis.agentInsights.length > 0);

  if (!hasContent) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
          <RefreshCw className="w-5 h-5 text-muted-foreground/50 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Synthèse en cours...
        </p>
        <p className="text-xs text-muted-foreground/70">
          Les insights émergent de la discussion
        </p>
      </div>
    );
  }

  const unresolvedCount = synthesis.disagreements.filter(d => !d.resolved).length;
  const mood = synthesis.conversationMood || 'exploratory';
  const MoodIcon = MOOD_CONFIG[mood].icon;

  return (
    <div className="h-full flex flex-col bg-card/50">
      {/* Header */}
      <div className="p-3 border-b bg-background/80">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Ce qui émerge
          </h3>
          <Badge variant="secondary" className={cn("text-[10px] h-5 gap-1", MOOD_CONFIG[mood].color, "text-white")}>
            <MoodIcon className="w-3 h-3" />
            {MOOD_CONFIG[mood].label}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Mise à jour: {synthesis.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          
          {/* Agent Insights - Transparency Section */}
          {synthesis.agentInsights && synthesis.agentInsights.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-violet-500" />
                Points de vue actifs
              </h4>
              <div className="space-y-2">
                {synthesis.agentInsights.map((insight) => (
                  <AgentInsightCard key={insight.agentId} insight={insight} />
                ))}
              </div>
            </section>
          )}

          {synthesis.agentInsights && synthesis.agentInsights.length > 0 && <Separator />}

          {/* What we agree on - Consensus Section */}
          {synthesis.options.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Points d'accord
              </h4>
              <div className="space-y-2">
                {synthesis.options.map((option) => (
                  <div key={option.id} className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50 rounded-lg p-2.5">
                    <p className="text-sm font-medium mb-2">{option.title}</p>
                    
                    {option.pros.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {option.pros.slice(0, 2).map((pro, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] py-0 h-5 bg-white/80 dark:bg-background/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                            {pro}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {option.supportingAgents.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground">
                          {option.supportingAgents.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* What still worries us - Disagreements */}
          {synthesis.disagreements.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Tensions à résoudre
                {unresolvedCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                    {unresolvedCount}
                  </Badge>
                )}
              </h4>
              <div className="space-y-2">
                {synthesis.disagreements.map((disagreement) => (
                  <DisagreementCard 
                    key={disagreement.id} 
                    disagreement={disagreement}
                    onResolve={() => onResolveDisagreement(disagreement.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {(synthesis.options.length > 0 || synthesis.disagreements.length > 0) && <Separator />}

          {/* Open Points - What to do next */}
          {synthesis.openPoints.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-blue-500" />
                À creuser
              </h4>
              <ul className="space-y-1.5">
                {synthesis.openPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm bg-blue-50/50 dark:bg-blue-950/20 rounded-md px-2.5 py-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground text-xs">{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Decision Draft */}
          {synthesis.decisionDraft && (
            <section>
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" />
                Direction possible
              </h4>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-sm">{synthesis.decisionDraft}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="h-7 text-xs flex-1">
                    Approfondir
                  </Button>
                  <Button size="sm" className="h-7 text-xs flex-1">
                    <ChevronRight className="w-3 h-3 mr-1" />
                    Décider
                  </Button>
                </div>
              </div>
            </section>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// Agent Insight Card Component
const AgentInsightCard: FC<{ insight: AgentInsight }> = ({ insight }) => {
  const role = inferRoleFromSpecialty(insight.specialty);
  const roleColor = role ? ROLE_COLORS[role] : ROLE_COLORS.product;
  
  return (
    <div className={cn("rounded-lg p-2.5 border", roleColor.replace('text-', 'border-').split(' ')[0] + '/30', roleColor)}>
      <div className="flex items-start gap-2 mb-2">
        <Avatar className="w-6 h-6 flex-shrink-0">
          <AvatarFallback className="text-[9px] font-semibold">
            {insight.agentName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate">{insight.agentName}</p>
          <p className="text-[10px] text-muted-foreground">{insight.specialty}</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <MessageSquare className="w-3 h-3" />
          {insight.contributionCount}
        </div>
      </div>
      
      {/* Current Stance */}
      <div className="bg-background/60 rounded-md px-2 py-1.5 mb-2">
        <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Position actuelle</p>
        <p className="text-xs leading-snug">{insight.stance}</p>
      </div>
      
      {/* Key Arguments */}
      {insight.keyArguments.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] font-medium text-muted-foreground mb-1">Arguments clés</p>
          <div className="flex flex-wrap gap-1">
            {insight.keyArguments.slice(0, 2).map((arg, i) => (
              <Badge key={i} variant="outline" className="text-[9px] h-4 bg-background/50">
                {arg}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Agreement Rate */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">Accord:</span>
        <Progress value={insight.agreementRate} className="h-1.5 flex-1" />
        <span className="text-[10px] font-medium">{insight.agreementRate}%</span>
      </div>
      
      {/* Bias indicator */}
      {insight.bias && (
        <div className="mt-2 flex items-start gap-1.5">
          <Eye className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground italic">
            Biais: {insight.bias}
          </p>
        </div>
      )}
    </div>
  );
};

// Disagreement Card Component
const DisagreementCard: FC<{ 
  disagreement: Disagreement; 
  onResolve: () => void;
}> = ({ disagreement, onResolve }) => {
  if (disagreement.resolved) {
    return (
      <div className="bg-muted/30 rounded-lg p-2.5 opacity-60">
        <div className="flex items-center gap-2">
          <Handshake className="w-4 h-4 text-emerald-600" />
          <p className="text-xs text-muted-foreground line-through flex-1">
            {disagreement.topic}
          </p>
          <Badge variant="outline" className="text-[10px] h-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
            Résolu
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50 rounded-lg p-2.5">
      <p className="text-xs font-medium mb-2">{disagreement.topic}</p>
      
      <div className="grid grid-cols-2 gap-1.5 text-[10px] mb-2">
        <div className="bg-white/80 dark:bg-background/50 rounded p-1.5">
          <p className="font-semibold text-pink-600 dark:text-pink-400 mb-0.5">{disagreement.agentA}</p>
          <p className="text-muted-foreground leading-tight line-clamp-2">{disagreement.positionA}</p>
        </div>
        <div className="bg-white/80 dark:bg-background/50 rounded p-1.5">
          <p className="font-semibold text-cyan-600 dark:text-cyan-400 mb-0.5">{disagreement.agentB}</p>
          <p className="text-muted-foreground leading-tight line-clamp-2">{disagreement.positionB}</p>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onResolve}
        className="w-full h-6 text-[10px] bg-white/50 dark:bg-background/50"
      >
        <Handshake className="w-3 h-3 mr-1.5" />
        Trouver un terrain d'entente
      </Button>
    </div>
  );
};
