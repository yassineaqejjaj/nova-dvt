import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Clock, Zap, TrendingUp, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  EstimationType, 
  FeatureInput, 
  Estimation, 
  EstimationContext, 
  ConfidenceLevel,
  COMPLEXITY_CONFIG 
} from "./types";

interface StepGenerateProps {
  estimationType: EstimationType;
  features: FeatureInput[];
  context: EstimationContext | null;
  estimations: Estimation[];
  onEstimationsGenerated: (estimations: Estimation[], confidence: ConfidenceLevel) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepGenerate = ({ 
  estimationType, 
  features, 
  context,
  estimations: initialEstimations,
  onEstimationsGenerated, 
  onNext, 
  onBack 
}: StepGenerateProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [estimations, setEstimations] = useState<Estimation[]>(initialEstimations);
  const [confidenceLevel, setConfidenceLevel] = useState<ConfidenceLevel>('medium');

  useEffect(() => {
    if (estimations.length === 0 && features.length > 0) {
      generateEstimations();
    }
  }, []);

  const calculateConfidence = (): ConfidenceLevel => {
    let score = 0;
    
    // Context quality
    if (context) {
      score += 30;
      if (context.vision) score += 10;
      if (context.objectives.length > 0) score += 10;
      if (context.constraints) score += 10;
    }

    // Features quality
    const avgEstimability = features.reduce((sum, f) => sum + f.estimabilityScore, 0) / features.length;
    if (avgEstimability >= 80) score += 30;
    else if (avgEstimability >= 60) score += 20;
    else score += 10;

    // Homogeneity
    const tooLargeCount = features.filter(f => f.isTooLarge).length;
    if (tooLargeCount === 0) score += 10;

    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const generateEstimations = async () => {
    setIsGenerating(true);
    try {
      const confidence = calculateConfidence();
      setConfidenceLevel(confidence);

      const featuresText = features.map(f => f.description).join('\n- ');
      const contextText = context 
        ? `Projet: ${context.name}
Vision: ${context.vision}
Objectifs: ${context.objectives.join(', ')}
Contraintes: ${context.constraints}
Audience: ${context.targetAudience}`
        : 'Aucun contexte spécifié';

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Tu es un expert en estimation agile. Génère des estimations détaillées.

${contextText}

Éléments à estimer (type: ${estimationType}):
- ${featuresText}

Niveau de confiance de l'estimation: ${confidence}

Pour chaque élément, fournis:
- complexity: XS/S/M/L/XL (T-shirt sizing)
- storyPoints: nombre (1-2 pour XS, 3-5 pour S, 8-13 pour M, 21-34 pour L, 55+ pour XL)
- hours: {min, max} en heures
- confidence: Haute/Moyenne/Basse
- reasoning: explication détaillée du sizing
- dependencies: liste des dépendances identifiées
- risks: liste des risques potentiels
- assumptions: hypothèses prises pour l'estimation

Réponds en JSON uniquement:
{
  "estimations": [
    {
      "feature": "nom court",
      "complexity": "M",
      "storyPoints": 8,
      "hours": {"min": 8, "max": 16},
      "confidence": "Moyenne",
      "reasoning": "Explication détaillée...",
      "dependencies": ["dep1", "dep2"],
      "risks": ["risk1"],
      "assumptions": ["assumption1"]
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
      const newEstimations = result.estimations || [];
      setEstimations(newEstimations);
      onEstimationsGenerated(newEstimations, confidence);
      toast.success("Estimations générées avec succès!");
    } catch (error) {
      console.error('Error generating estimations:', error);
      toast.error("Erreur lors de la génération des estimations");
    } finally {
      setIsGenerating(false);
    }
  };

  const totalPoints = estimations.reduce((sum, est) => sum + est.storyPoints, 0);
  const totalHoursMin = estimations.reduce((sum, est) => sum + est.hours.min, 0);
  const totalHoursMax = estimations.reduce((sum, est) => sum + est.hours.max, 0);

  const confidenceColors = {
    high: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    low: 'bg-red-100 text-red-800 border-red-200'
  };

  const confidenceLabels = {
    high: 'Confiance élevée',
    medium: 'Confiance moyenne',
    low: 'Confiance faible'
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Analyse & Sizing</h2>
        <p className="text-muted-foreground mt-2">
          Nova analyse chaque élément et génère des estimations contextualisées
        </p>
      </div>

      {isGenerating ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <h3 className="text-lg font-medium mb-2">Analyse en cours...</h3>
            <p className="text-muted-foreground">
              Nova évalue la complexité, les dépendances et les risques
            </p>
            <Progress value={66} className="mt-4 max-w-xs mx-auto" />
          </CardContent>
        </Card>
      ) : estimations.length > 0 ? (
        <>
          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Zap className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{totalPoints}</p>
                <p className="text-xs text-muted-foreground">Story Points</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{totalHoursMin}h</p>
                <p className="text-xs text-muted-foreground">Minimum</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{totalHoursMax}h</p>
                <p className="text-xs text-muted-foreground">Maximum</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                <Badge className={confidenceColors[confidenceLevel]}>
                  {confidenceLabels[confidenceLevel]}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Estimations List */}
          <div className="space-y-4">
            {estimations.map((estimation, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{estimation.feature}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={COMPLEXITY_CONFIG[estimation.complexity].color}>
                        {estimation.complexity}
                      </Badge>
                      <Badge variant="outline">
                        {estimation.storyPoints} pts
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{estimation.hours.min}-{estimation.hours.max}h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span>Confiance: {estimation.confidence}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-1">Raisonnement</h4>
                    <p className="text-sm text-muted-foreground">{estimation.reasoning}</p>
                  </div>

                  {estimation.assumptions && estimation.assumptions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Hypothèses</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {estimation.assumptions.map((a, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {estimation.dependencies.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Dépendances</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {estimation.dependencies.map((dep, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {dep}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {estimation.risks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        Risques
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {estimation.risks.map((risk, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center">
            <Button variant="outline" onClick={generateEstimations} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Régénérer
            </Button>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Aucune estimation générée</p>
            <Button onClick={generateEstimations} className="mt-4">
              Lancer l'analyse
            </Button>
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
          disabled={estimations.length === 0}
          className="gap-2"
        >
          Finaliser
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
