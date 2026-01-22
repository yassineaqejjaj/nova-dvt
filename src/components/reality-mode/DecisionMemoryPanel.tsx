import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { 
  History, 
  Brain, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import { DecisionLogEntry } from './types';

interface DecisionMemoryPanelProps {
  userId: string;
  currentTopic?: string;
  onSelectDecision?: (decision: DecisionLogEntry) => void;
}

export const DecisionMemoryPanel: React.FC<DecisionMemoryPanelProps> = ({
  userId,
  currentTopic,
  onSelectDecision
}) => {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [similarDecision, setSimilarDecision] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDecisions();
  }, [userId]);

  useEffect(() => {
    if (currentTopic && decisions.length > 0) {
      findSimilarDecision(currentTopic);
    }
  }, [currentTopic, decisions]);

  const loadDecisions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('decision_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setDecisions(data || []);
    } catch (error) {
      console.error('Error loading decisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const findSimilarDecision = async (topic: string) => {
    // Simple keyword matching for now - could be enhanced with embeddings
    const keywords = topic.toLowerCase().split(' ').filter(w => w.length > 3);
    
    const similar = decisions.find(d => {
      const decisionText = `${d.debate_topic} ${d.context || ''}`.toLowerCase();
      return keywords.some(k => decisionText.includes(k));
    });

    if (similar && similar.id !== decisions[0]?.id) {
      const timeDiff = new Date().getTime() - new Date(similar.created_at).getTime();
      const monthsAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30));
      
      setSimilarDecision({
        ...similar,
        monthsAgo
      });
    } else {
      setSimilarDecision(null);
    }
  };

  const getConfidenceBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge className="bg-green-500/20 text-green-700">Haute</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500/20 text-amber-700">Moyenne</Badge>;
      case 'low':
        return <Badge className="bg-red-500/20 text-red-700">Basse</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Similar Decision Alert */}
      {similarDecision && (
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/30">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Mémoire Organisationnelle
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Une question similaire a été débattue il y a <strong>{similarDecision.monthsAgo} mois</strong>.
              </p>
              <div className="mt-2 p-2 bg-background/50 rounded">
                <p className="text-xs font-medium">{similarDecision.debate_topic}</p>
                {similarDecision.option_chosen && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Décision: {similarDecision.option_chosen.title}
                  </p>
                )}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2"
                onClick={() => onSelectDecision?.(similarDecision)}
              >
                Voir les détails
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Decisions */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-muted-foreground" />
          <h4 className="font-semibold text-sm">Décisions Récentes</h4>
          <Badge variant="secondary" className="text-xs">{decisions.length}</Badge>
        </div>

        <ScrollArea className="h-[300px]">
          <div className="space-y-2 pr-2">
            {decisions.map((decision) => (
              <div
                key={decision.id}
                className="p-3 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => onSelectDecision?.(decision)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{decision.debate_topic}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(decision.created_at).toLocaleDateString('fr-FR')}
                      </span>
                      {getConfidenceBadge(decision.confidence_level)}
                    </div>
                  </div>
                  {decision.option_chosen ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                </div>
              </div>
            ))}

            {decisions.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune décision enregistrée</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};
