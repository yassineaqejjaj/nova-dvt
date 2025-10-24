import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, Lightbulb, TrendingUp, Target, AlertCircle } from 'lucide-react';

interface ResearchSynthesizerProps {
  onSave?: (data: any) => void;
  workflowContext?: Record<string, any>;
}

export const ResearchSynthesizer: React.FC<ResearchSynthesizerProps> = ({
  onSave,
  workflowContext
}) => {
  const [researchData, setResearchData] = useState('');
  const [objectives, setObjectives] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleGenerate = async () => {
    if (!researchData.trim()) {
      toast.error('Veuillez fournir les données de recherche');
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase.functions.invoke('synthesize-research-results', {
        body: { researchData, objectives }
      });

      if (error) throw error;
      setResults(data.results);
      toast.success('Synthèse générée avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la synthèse');
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
        title: 'Synthèse de Recherche Utilisateur',
        artifact_type: 'canvas',
        content: results,
        metadata: { researchData, objectives, ...workflowContext }
      });

      if (error) throw error;
      toast.success('Synthèse sauvegardée avec succès');
      if (onSave) onSave(results);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    const variants: Record<string, any> = {
      high: { variant: 'default', label: 'Haute' },
      medium: { variant: 'secondary', label: 'Moyenne' },
      low: { variant: 'outline', label: 'Faible' }
    };
    const config = variants[confidence] || variants.medium;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'text-destructive',
      medium: 'text-warning',
      low: 'text-muted-foreground'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="research-data">Données de Recherche *</Label>
          <Textarea
            id="research-data"
            value={researchData}
            onChange={(e) => setResearchData(e.target.value)}
            placeholder="Collez vos notes d'entretiens, résultats de sondages, observations, transcriptions, etc."
            rows={8}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Incluez toutes les données collectées lors de vos recherches
          </p>
        </div>

        <div>
          <Label htmlFor="objectives-synth">Objectifs de Recherche (optionnel)</Label>
          <Textarea
            id="objectives-synth"
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            placeholder="Collez les objectifs initiaux pour une analyse alignée..."
            rows={3}
            className="mt-2"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !researchData.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            <>
              <Lightbulb className="w-4 h-4 mr-2" />
              Synthétiser les Résultats
            </>
          )}
        </Button>
      </div>

      {results && (
        <div className="space-y-4">
          {results.keyFindings && results.keyFindings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Résultats Clés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results.keyFindings.map((finding: any, idx: number) => (
                  <div key={idx} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm flex-1">{finding.finding}</p>
                      {finding.confidence && getConfidenceBadge(finding.confidence)}
                    </div>
                    {finding.evidence && (
                      <p className="text-xs text-muted-foreground pl-3 border-l-2">
                        {finding.evidence}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {results.insights && results.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Insights Actionnables
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.insights.map((insight: any, idx: number) => (
                  <div key={idx} className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-semibold ${getPriorityColor(insight.priority)}`}>
                        {insight.insight}
                      </h4>
                      <Badge variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'secondary' : 'outline'}>
                        {insight.priority === 'high' ? 'Haute' : insight.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </Badge>
                    </div>
                    {insight.impact && (
                      <p className="text-sm"><strong>Impact :</strong> {insight.impact}</p>
                    )}
                    {insight.recommendation && (
                      <div className="mt-2 p-2 bg-background rounded border-l-2 border-primary">
                        <p className="text-sm"><strong>→ Recommandation :</strong> {insight.recommendation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {results.userNeeds && results.userNeeds.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Besoins Utilisateurs Identifiés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results.userNeeds.map((need: string, idx: number) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{need}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {results.opportunityAreas && results.opportunityAreas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Opportunités Produit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results.opportunityAreas.map((opp: string, idx: number) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-0.5">→</span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {results.nextSteps && results.nextSteps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Prochaines Étapes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results.nextSteps.map((step: string, idx: number) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="font-medium">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
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
                Sauvegarder la Synthèse
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
