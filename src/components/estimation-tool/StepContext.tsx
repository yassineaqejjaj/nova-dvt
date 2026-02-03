import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, CheckCircle2, AlertTriangle, ArrowRight, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EstimationContext } from "./types";

interface StepContextProps {
  context: EstimationContext | null;
  onContextLoaded: (context: EstimationContext) => void;
  onNext: () => void;
}

interface ProductContext {
  id: string;
  name: string;
  vision: string | null;
  objectives: string[] | null;
  constraints: string | null;
  target_audience: string | null;
  is_active: boolean;
}

export const StepContext = ({ context, onContextLoaded, onNext }: StepContextProps) => {
  const [contexts, setContexts] = useState<ProductContext[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchContexts();
  }, []);

  const fetchContexts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('product_contexts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('is_active', { ascending: false });

      if (error) throw error;
      
      const mappedContexts: ProductContext[] = (data || []).map(ctx => ({
        id: ctx.id,
        name: ctx.name,
        vision: ctx.vision,
        objectives: Array.isArray(ctx.objectives) ? ctx.objectives as string[] : [],
        constraints: ctx.constraints,
        target_audience: ctx.target_audience,
        is_active: ctx.is_active
      }));
      
      setContexts(mappedContexts);

      // Auto-load active context
      const activeContext = mappedContexts.find(c => c.is_active);
      if (activeContext) {
        onContextLoaded({
          name: activeContext.name,
          vision: activeContext.vision || '',
          objectives: activeContext.objectives || [],
          constraints: activeContext.constraints || '',
          targetAudience: activeContext.target_audience || ''
        });
      }
    } catch (error) {
      console.error('Error fetching contexts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectContext = (ctx: ProductContext) => {
    onContextLoaded({
      name: ctx.name,
      vision: ctx.vision || '',
      objectives: ctx.objectives || [],
      constraints: ctx.constraints || '',
      targetAudience: ctx.target_audience || ''
    });
  };

  const hasContext = context !== null;
  const contextQuality = hasContext 
    ? (context.vision && context.objectives.length > 0 ? 'high' : context.vision || context.objectives.length > 0 ? 'medium' : 'low')
    : 'none';

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Contexte Projet</h2>
        <p className="text-muted-foreground mt-2">
          Les estimations ne sont pertinentes que dans un contexte défini (équipe, stack, contraintes)
        </p>
      </div>

      {!hasContext && (
        <Alert variant="default" className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Sans contexte, les estimations seront génériques et moins fiables. 
            Nous recommandons fortement de charger un contexte produit.
          </AlertDescription>
        </Alert>
      )}

      {hasContext && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Contexte chargé</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {contextQuality === 'high' ? 'Complet' : contextQuality === 'medium' ? 'Partiel' : 'Minimal'}
              </Badge>
            </div>
            <CardDescription>{context.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="mb-3"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showDetails ? 'Masquer les détails' : 'Voir les détails'}
            </Button>

            {showDetails && (
              <div className="space-y-3 text-sm border-t pt-3">
                {context.vision && (
                  <div>
                    <span className="font-medium text-muted-foreground">Vision:</span>
                    <p className="mt-1">{context.vision}</p>
                  </div>
                )}
                {context.objectives.length > 0 && (
                  <div>
                    <span className="font-medium text-muted-foreground">Objectifs:</span>
                    <ul className="mt-1 list-disc list-inside">
                      {context.objectives.slice(0, 3).map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {context.constraints && (
                  <div>
                    <span className="font-medium text-muted-foreground">Contraintes:</span>
                    <p className="mt-1">{context.constraints}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!hasContext && contexts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground">Sélectionner un contexte</h3>
          <div className="grid gap-3">
            {contexts.slice(0, 4).map((ctx) => (
              <Card
                key={ctx.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => selectContext(ctx)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{ctx.name}</p>
                      {ctx.vision && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {ctx.vision}
                        </p>
                      )}
                    </div>
                  </div>
                  {ctx.is_active && (
                    <Badge variant="outline" className="text-xs">Actif</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} className="gap-2">
          {hasContext ? 'Continuer' : 'Continuer sans contexte'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
