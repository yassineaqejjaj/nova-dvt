import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, XCircle, HelpCircle, AlertTriangle, 
  ChevronRight, Handshake, RefreshCw 
} from 'lucide-react';
import { LiveSynthesis, Disagreement } from '@/types';

interface LiveSynthesisPanelProps {
  synthesis: LiveSynthesis;
  onResolveDisagreement: (disagreementId: string) => void;
}

export const LiveSynthesisPanel: React.FC<LiveSynthesisPanelProps> = ({
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
          La synthèse se construit pendant la discussion...
        </p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="p-3 border-b">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          Synthèse en direct
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Mise à jour: {synthesis.lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          {/* Options */}
          {synthesis.options.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                Options identifiées
              </h4>
              <div className="space-y-2">
                {synthesis.options.map((option) => (
                  <div key={option.id} className="bg-muted/50 rounded-lg p-2.5">
                    <p className="text-sm font-medium mb-1.5">{option.title}</p>
                    
                    {option.pros.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {option.pros.slice(0, 2).map((pro, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300 border-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {pro}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {option.cons.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {option.cons.slice(0, 2).map((con, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300 border-red-200">
                            <XCircle className="w-3 h-3 mr-1" />
                            {con}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {option.supportingAgents.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Soutenu par: {option.supportingAgents.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disagreements */}
          {synthesis.disagreements.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                Points de désaccord
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
            </div>
          )}

          <Separator />

          {/* Open Points */}
          {synthesis.openPoints.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                Points ouverts
              </h4>
              <ul className="space-y-1">
                {synthesis.openPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <HelpCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Decision Draft */}
          {synthesis.decisionDraft && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                Ébauche de décision
              </h4>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-sm">{synthesis.decisionDraft}</p>
                <Button size="sm" className="mt-2 h-7">
                  <ChevronRight className="w-3 h-3 mr-1" />
                  Valider
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

const DisagreementCard: React.FC<{ 
  disagreement: Disagreement; 
  onResolve: () => void;
}> = ({ disagreement, onResolve }) => {
  if (disagreement.resolved) {
    return (
      <div className="bg-muted/30 rounded-lg p-2.5 opacity-60">
        <div className="flex items-center gap-2">
          <Handshake className="w-4 h-4 text-green-600" />
          <p className="text-xs text-muted-foreground line-through">
            {disagreement.topic}
          </p>
          <Badge variant="outline" className="text-xs">Résolu</Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5">
      <p className="text-sm font-medium mb-2">{disagreement.topic}</p>
      
      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
        <div className="bg-background/80 rounded p-1.5">
          <p className="font-medium text-pink-600 dark:text-pink-400">{disagreement.agentA}</p>
          <p className="text-muted-foreground">{disagreement.positionA}</p>
        </div>
        <div className="bg-background/80 rounded p-1.5">
          <p className="font-medium text-blue-600 dark:text-blue-400">{disagreement.agentB}</p>
          <p className="text-muted-foreground">{disagreement.positionB}</p>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onResolve}
        className="w-full h-6 text-xs"
      >
        <Handshake className="w-3 h-3 mr-1" />
        Demander résolution
      </Button>
    </div>
  );
};
