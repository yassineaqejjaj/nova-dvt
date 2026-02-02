import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Target, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Eye,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ProductContext } from './types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StepContextProps {
  context: ProductContext | null;
  onContextChange: (context: ProductContext) => void;
  onNext: () => void;
}

export const StepContext = ({ context, onContextChange, onNext }: StepContextProps) => {
  const [contexts, setContexts] = useState<ProductContext[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        .select('id, name, vision, objectives, target_audience, target_kpis, constraints')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('is_active', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedContexts: ProductContext[] = (data || []).map(c => ({
        id: c.id,
        name: c.name,
        vision: c.vision,
        objectives: c.objectives as string[] | null,
        target_audience: c.target_audience,
        target_kpis: c.target_kpis as string[] | null,
        constraints: c.constraints,
      }));

      setContexts(formattedContexts);
      
      // Auto-select first (active) context if none selected
      if (!context && formattedContexts.length > 0) {
        onContextChange(formattedContexts[0]);
      }
    } catch (error) {
      console.error('Error loading contexts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasMinimalContext = context && (context.vision || context.objectives?.length);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Contexte utilisé pour la génération
          </CardTitle>
          <CardDescription>
            Ce contexte sera utilisé pour cadrer les personas générés et garantir leur pertinence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : contexts.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Aucun contexte produit trouvé. Créez-en un dans la section "Structurer" pour améliorer la qualité des personas.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Select
                  value={context?.id || ''}
                  onValueChange={(value) => {
                    const selected = contexts.find(c => c.id === value);
                    if (selected) onContextChange(selected);
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sélectionner un contexte" />
                  </SelectTrigger>
                  <SelectContent>
                    {contexts.map((ctx) => (
                      <SelectItem key={ctx.id} value={ctx.id}>
                        {ctx.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={loadContexts}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {context && (
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Contexte actif
                      </Badge>
                      <span className="font-medium">{context.name}</span>
                    </div>
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
                    <div className="space-y-3 pt-2 border-t">
                      {context.vision && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground uppercase">Vision</span>
                          <p className="text-sm mt-1">{context.vision}</p>
                        </div>
                      )}
                      {context.target_audience && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground uppercase">Audience cible</span>
                          <p className="text-sm mt-1">{context.target_audience}</p>
                        </div>
                      )}
                      {context.objectives && context.objectives.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground uppercase">Objectifs clés</span>
                          <ul className="text-sm mt-1 space-y-1">
                            {context.objectives.slice(0, 3).map((obj, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                {obj}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {!hasMinimalContext && context && (
        <Alert variant="default" className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Ce contexte manque de détails (vision, objectifs). Les personas générés seront plus génériques.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!context}>
          Continuer
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
