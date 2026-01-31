import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Target, Eye, ArrowRight, ArrowLeft, Check, AlertTriangle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ProductContextSummary } from './types';

interface StepContextProps {
  selectedContext: ProductContextSummary | null;
  onSelectContext: (context: ProductContextSummary) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepContext = ({ selectedContext, onSelectContext, onNext, onBack }: StepContextProps) => {
  const [contexts, setContexts] = useState<ProductContextSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadContexts();
  }, []);

  const loadContexts = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('product_contexts')
        .select('id, name, vision, objectives, target_kpis, target_audience, is_active, metadata')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('is_active', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const mapped: ProductContextSummary[] = (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        vision: c.vision,
        objectives: Array.isArray(c.objectives) ? c.objectives : [],
        target_kpis: Array.isArray(c.target_kpis) ? c.target_kpis : [],
        target_audience: c.target_audience,
        industrySector: c.metadata?.industrySector,
        isActive: c.is_active,
      }));

      setContexts(mapped);

      // Auto-select active context if none selected
      if (!selectedContext) {
        const active = mapped.find((c: any) => c.isActive) || mapped[0];
        if (active) onSelectContext(active);
      }
    } catch (error) {
      console.error('Error loading contexts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Contexte de génération
        </CardTitle>
        <CardDescription>
          Le contexte produit influence directement la qualité et la pertinence des User Stories générées
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Context explanation */}
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex gap-3">
            <Sparkles className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Pourquoi le contexte est important ?
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Nova utilise votre contexte produit (vision, objectifs, KPIs, audience) pour générer 
                des User Stories alignées avec votre stratégie. Sans contexte, les stories seront génériques.
              </p>
            </div>
          </div>
        </div>

        {/* Context selection */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Chargement des contextes...
          </div>
        ) : contexts.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-amber-500" />
            <p className="text-muted-foreground">Aucun contexte produit configuré</p>
            <p className="text-sm text-muted-foreground mt-1">
              Les stories seront générées sans alignement stratégique
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-2">
              {contexts.map((context: any) => (
                <div
                  key={context.id}
                  onClick={() => onSelectContext(context)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                    selectedContext?.id === context.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {selectedContext?.id === context.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                      <span className="font-medium">{context.name}</span>
                      {context.isActive && (
                        <Badge variant="default" className="text-xs">Actif</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{context.objectives?.length || 0} objectifs</span>
                      <span>•</span>
                      <span>{context.target_kpis?.length || 0} KPIs</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Selected context preview */}
        {selectedContext && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Contexte utilisé pour la génération</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {showDetails ? 'Masquer' : 'Voir détails'}
              </Button>
            </div>

            {showDetails && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                {selectedContext.vision && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Vision</p>
                    <p className="text-sm mt-1">{selectedContext.vision}</p>
                  </div>
                )}
                {selectedContext.objectives.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Objectifs clés</p>
                    <ul className="mt-1 space-y-1">
                      {selectedContext.objectives.slice(0, 3).map((obj, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedContext.target_kpis.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">KPIs principaux</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedContext.target_kpis.slice(0, 4).map((kpi, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {kpi}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedContext.target_audience && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Audience cible</p>
                    <p className="text-sm mt-1">{selectedContext.target_audience}</p>
                  </div>
                )}
              </div>
            )}

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-primary">
                ✓ Ce contexte sera utilisé pour cadrer les User Stories générées
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Button onClick={onNext}>
            Continuer
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepContext;
