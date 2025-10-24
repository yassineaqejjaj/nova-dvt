import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';

interface ResearchObjectivesGeneratorProps {
  onSave?: (data: any) => void;
  workflowContext?: Record<string, any>;
}

export const ResearchObjectivesGenerator: React.FC<ResearchObjectivesGeneratorProps> = ({
  onSave,
  workflowContext
}) => {
  const [context, setContext] = useState('');
  const [productInfo, setProductInfo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleGenerate = async () => {
    if (!context.trim()) {
      toast.error('Veuillez fournir le contexte de recherche');
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase.functions.invoke('generate-research-objectives', {
        body: { context, productInfo }
      });

      if (error) throw error;
      setResults(data.results);
      toast.success('Objectifs de recherche générés avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la génération des objectifs');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!results) return;

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase.from('artifacts').insert({
        user_id: user.id,
        title: 'Objectifs de Recherche Utilisateur',
        artifact_type: 'canvas',
        content: results,
        metadata: { context, productInfo, ...workflowContext }
      });

      if (error) throw error;
      toast.success('Objectifs sauvegardés avec succès');
      if (onSave) onSave(results);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="context">Contexte de Recherche *</Label>
          <Textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Décrivez le contexte : Que voulez-vous apprendre sur vos utilisateurs ? Quelles décisions cette recherche doit-elle éclairer ?"
            rows={4}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="productInfo">Informations Produit (optionnel)</Label>
          <Textarea
            id="productInfo"
            value={productInfo}
            onChange={(e) => setProductInfo(e.target.value)}
            placeholder="Décrivez votre produit, fonctionnalité ou domaine d'étude..."
            rows={3}
            className="mt-2"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !context.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Génération en cours...
            </>
          ) : (
            'Générer les Objectifs de Recherche'
          )}
        </Button>
      </div>

      {results && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Objectifs de Recherche</CardTitle>
              <CardDescription>Objectifs structurés avec questions associées</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.objectives?.map((obj: any, idx: number) => (
                <div key={idx} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <p className="font-semibold">{obj.objective}</p>
                      <p className="text-sm text-muted-foreground">{obj.rationale}</p>
                      {obj.questions && obj.questions.length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 space-y-1">
                          <p className="text-sm font-medium">Questions de recherche :</p>
                          {obj.questions.map((q: string, qIdx: number) => (
                            <p key={qIdx} className="text-sm">• {q}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {results.recommendedMethodologies && (
            <Card>
              <CardHeader>
                <CardTitle>Méthodologies Recommandées</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results.recommendedMethodologies.map((method: string, idx: number) => (
                    <li key={idx} className="text-sm">• {method}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder et Passer à l'Étape Suivante
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
