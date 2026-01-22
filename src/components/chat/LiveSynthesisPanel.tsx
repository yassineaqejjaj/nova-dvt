import type { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, XCircle, HelpCircle, AlertTriangle, 
  ChevronRight, Handshake, RefreshCw, Lightbulb, Target
} from 'lucide-react';
import { LiveSynthesis, Disagreement } from '@/types';
import { cn } from '@/lib/utils';

interface LiveSynthesisPanelProps {
  synthesis: LiveSynthesis;
  onResolveDisagreement: (disagreementId: string) => void;
}

export const LiveSynthesisPanel: FC<LiveSynthesisPanelProps> = ({
  synthesis,
  onResolveDisagreement,
}) => {
  const hasContent = synthesis.options.length > 0 || 
                     synthesis.openPoints.length > 0 || 
                     synthesis.disagreements.length > 0;

  if (!hasContent) {
    return (
      <Card className="p-4 h-full flex flex-col items-center justify-center text-center">
        <RefreshCw className="w-8 h-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">
          La synthèse émerge de la discussion...
        </p>
      </Card>
    );
  }

  const unresolvedCount = synthesis.disagreements.filter(d => !d.resolved).length;

  return (
    <Card className="h-full flex flex-col">
      <div className="p-3 border-b">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Ce qui émerge
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Mise à jour: {synthesis.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-5">
          {/* What we agree on - Consensus Section */}
          {synthesis.options.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Ce qu'on partage
              </h4>
              <div className="space-y-2.5">
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
                      <p className="text-[10px] text-muted-foreground">
                        {option.supportingAgents.join(', ')}
                      </p>
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
                Ce qui nous freine
                {unresolvedCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px]">
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

          <Separator />

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
                    <span className="text-muted-foreground">{point}</span>
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
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    Approfondir
                  </Button>
                  <Button size="sm" className="h-7 text-xs">
                    <ChevronRight className="w-3 h-3 mr-1" />
                    Transformer en décision
                  </Button>
                </div>
              </div>
            </section>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

const DisagreementCard: FC<{ 
  disagreement: Disagreement; 
  onResolve: () => void;
}> = ({ disagreement, onResolve }) => {
  if (disagreement.resolved) {
    return (
      <div className="bg-muted/30 rounded-lg p-2.5 opacity-60">
        <div className="flex items-center gap-2">
          <Handshake className="w-4 h-4 text-emerald-600" />
          <p className="text-xs text-muted-foreground line-through">
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
    <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5">
      <p className="text-sm font-medium mb-2">{disagreement.topic}</p>
      
      <div className="grid grid-cols-2 gap-2 text-xs mb-2.5">
        <div className="bg-white/80 dark:bg-background/50 rounded p-2">
          <p className="font-medium text-pink-600 dark:text-pink-400 mb-0.5">{disagreement.agentA}</p>
          <p className="text-muted-foreground leading-snug">{disagreement.positionA}</p>
        </div>
        <div className="bg-white/80 dark:bg-background/50 rounded p-2">
          <p className="font-medium text-blue-600 dark:text-blue-400 mb-0.5">{disagreement.agentB}</p>
          <p className="text-muted-foreground leading-snug">{disagreement.positionB}</p>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onResolve}
        className="w-full h-6 text-xs bg-white/50 dark:bg-background/50"
      >
        <Handshake className="w-3 h-3 mr-1.5" />
        Débloquer la tension
      </Button>
    </div>
  );
};
