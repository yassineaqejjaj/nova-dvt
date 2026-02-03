import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, Lightbulb, AlertTriangle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EstimationType, FeatureInput, EstimationContext } from "./types";

interface StepInputProps {
  estimationType: EstimationType;
  features: FeatureInput[];
  rawInput: string;
  context: EstimationContext | null;
  onFeaturesUpdated: (features: FeatureInput[], rawInput: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepInput = ({ 
  estimationType, 
  features, 
  rawInput,
  context,
  onFeaturesUpdated, 
  onNext, 
  onBack 
}: StepInputProps) => {
  const [input, setInput] = useState(rawInput);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedFeatures, setAnalyzedFeatures] = useState<FeatureInput[]>(features);

  const typeLabels: Record<EstimationType, string> = {
    features: 'fonctionnalités',
    epics: 'epics',
    stories: 'user stories',
    mix: 'éléments'
  };

  const placeholders: Record<EstimationType, string> = {
    features: `Décrivez les fonctionnalités à estimer (une par ligne)...

Exemples :
- Système d'authentification avec SSO
- Dashboard temps réel avec graphiques
- Export PDF des rapports`,
    epics: `Décrivez les epics à estimer (un par ligne)...

Exemples :
- Refonte du parcours d'onboarding
- Intégration avec le CRM client
- Module de facturation automatisée`,
    stories: `Décrivez les user stories à estimer (une par ligne)...

Exemples :
- En tant qu'utilisateur, je veux me connecter via Google
- En tant qu'admin, je veux exporter les données en CSV`,
    mix: `Décrivez les éléments à estimer (un par ligne)...

Vous pouvez mélanger features, epics et stories.
Nova adaptera son analyse à chaque niveau.`
  };

  const analyzeEstimability = async () => {
    if (!input.trim()) {
      toast.error("Veuillez décrire au moins un élément à estimer");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Analyse ces ${typeLabels[estimationType]} pour déterminer si elles sont estimables.
${context ? `Contexte: ${context.name} - ${context.vision}` : ''}

Éléments à analyser:
${input}

Pour chaque élément, évalue:
1. Est-il suffisamment clair pour être estimé ? (score 0-100)
2. Est-il trop large et devrait être découpé ?
3. Suggestions d'amélioration si nécessaire

Réponds en JSON uniquement:
{
  "features": [
    {
      "id": "1",
      "description": "texte original",
      "isEstimable": true/false,
      "estimabilityScore": 0-100,
      "isTooLarge": true/false,
      "suggestions": ["suggestion 1", "suggestion 2"]
    }
  ]
}`,
          mode: 'simple'
        }
      });

      if (error) throw error;

      const content = data?.response || data;
      let jsonString = typeof content === 'string' ? content : JSON.stringify(content);
      jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) jsonString = jsonMatch[0];
      
      const result = JSON.parse(jsonString);
      setAnalyzedFeatures(result.features || []);
      onFeaturesUpdated(result.features || [], input);
      toast.success("Analyse terminée");
    } catch (error) {
      console.error('Error analyzing features:', error);
      toast.error("Erreur lors de l'analyse");
      // Fallback: create basic features from input
      const lines = input.split('\n').filter(l => l.trim());
      const basicFeatures: FeatureInput[] = lines.map((line, i) => ({
        id: String(i + 1),
        description: line.replace(/^[-•]\s*/, '').trim(),
        isEstimable: true,
        estimabilityScore: 70
      }));
      setAnalyzedFeatures(basicFeatures);
      onFeaturesUpdated(basicFeatures, input);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Estimable', variant: 'default' as const, icon: CheckCircle2 };
    if (score >= 50) return { label: 'À clarifier', variant: 'secondary' as const, icon: AlertTriangle };
    return { label: 'Trop vague', variant: 'destructive' as const, icon: AlertTriangle };
  };

  const averageScore = analyzedFeatures.length > 0
    ? Math.round(analyzedFeatures.reduce((sum, f) => sum + f.estimabilityScore, 0) / analyzedFeatures.length)
    : 0;

  const canProceed = analyzedFeatures.length > 0 && averageScore >= 40;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Décrivez vos {typeLabels[estimationType]}</h2>
        <p className="text-muted-foreground mt-2">
          Nova analysera la clarté et la granularité de chaque élément avant estimation
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Éléments à estimer</CardTitle>
              <CardDescription>
                Décrivez précisément ce que vous souhaitez estimer
              </CardDescription>
            </div>
            <Badge variant="outline" className="capitalize">
              {typeLabels[estimationType]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholders[estimationType]}
            rows={8}
            className="font-mono text-sm"
          />

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lightbulb className="w-4 h-4" />
            <span>Conseil: Soyez précis sur le périmètre et les contraintes de chaque élément</span>
          </div>

          <Button
            onClick={analyzeEstimability}
            disabled={isAnalyzing || !input.trim()}
            variant="secondary"
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyser l'estimabilité
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analyzedFeatures.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Résultat de l'analyse</CardTitle>
              <Badge 
                variant={averageScore >= 70 ? "default" : averageScore >= 50 ? "secondary" : "destructive"}
              >
                Score moyen: {averageScore}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {analyzedFeatures.map((feature, index) => {
              const badge = getScoreBadge(feature.estimabilityScore);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={feature.id}
                  className="p-3 border rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium flex-1">{feature.description}</p>
                    <Badge variant={badge.variant} className="shrink-0 gap-1">
                      <BadgeIcon className="w-3 h-3" />
                      {badge.label}
                    </Badge>
                  </div>

                  {feature.isTooLarge && (
                    <Alert variant="default" className="py-2">
                      <AlertTriangle className="h-3 w-3" />
                      <AlertDescription className="text-xs">
                        Cet élément semble trop large. Envisagez de le découper.
                      </AlertDescription>
                    </Alert>
                  )}

                  {feature.suggestions && feature.suggestions.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Suggestions:</span>
                      <ul className="mt-1 list-disc list-inside">
                        {feature.suggestions.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!canProceed}
          className="gap-2"
        >
          Générer les estimations
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
