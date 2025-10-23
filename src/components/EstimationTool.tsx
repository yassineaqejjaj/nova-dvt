import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calculator, Sparkles, Loader2, Save, Clock, Zap, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ContextSelector } from "@/components/ContextSelector";

interface Estimation {
  feature: string;
  complexity: 'XS' | 'S' | 'M' | 'L' | 'XL';
  storyPoints: number;
  hours: { min: number; max: number };
  confidence: string;
  reasoning: string;
  dependencies: string[];
  risks: string[];
}

export const EstimationTool = () => {
  const [features, setFeatures] = useState("");
  const [context, setContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const generateEstimations = async () => {
    if (!features.trim()) {
      toast.error("Veuillez décrire au moins une fonctionnalité");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Contexte projet: ${context || 'Non spécifié'}

Fonctionnalités à estimer:
${features}

Génère des estimations détaillées pour chaque fonctionnalité (JSON uniquement).
Utilise le T-shirt sizing et les story points:
- XS: 1-2 points, <4h
- S: 3-5 points, 4-8h
- M: 8-13 points, 1-2 jours
- L: 21-34 points, 3-5 jours
- XL: 55+ points, >5 jours

{
  "estimations": [
    {
      "feature": "Nom court de la fonctionnalité",
      "complexity": "M",
      "storyPoints": 8,
      "hours": { "min": 8, "max": 16 },
      "confidence": "Haute/Moyenne/Basse",
      "reasoning": "Explication détaillée de l'estimation",
      "dependencies": ["Dépendance 1", "Dépendance 2"],
      "risks": ["Risque 1", "Risque 2"]
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
      setEstimations(result.estimations || []);
      toast.success("Estimations générées avec succès!");
    } catch (error) {
      console.error('Error generating estimations:', error);
      toast.error("Erreur lors de la génération des estimations");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveAsArtifact = async () => {
    if (!estimations.length) {
      toast.error("Aucune estimation à sauvegarder");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const totalPoints = estimations.reduce((sum, est) => sum + est.storyPoints, 0);
      const totalHoursMin = estimations.reduce((sum, est) => sum + est.hours.min, 0);
      const totalHoursMax = estimations.reduce((sum, est) => sum + est.hours.max, 0);

      const { error } = await supabase.from('artifacts').insert({
        user_id: user.id,
        artifact_type: 'canvas' as const,
        title: `Estimations - ${new Date().toLocaleDateString('fr-FR')}`,
        content: { estimations, features, context, summary: { totalPoints, totalHoursMin, totalHoursMax } },
        metadata: { type: 'estimations', generatedAt: new Date().toISOString() }
      } as any);

      if (error) throw error;
      toast.success("Estimations sauvegardées dans les artifacts!");
    } catch (error) {
      console.error('Error saving artifact:', error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const getComplexityColor = (complexity: string) => {
    const colors = {
      XS: 'bg-green-100 text-green-800 border-green-200',
      S: 'bg-blue-100 text-blue-800 border-blue-200',
      M: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      L: 'bg-orange-100 text-orange-800 border-orange-200',
      XL: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[complexity as keyof typeof colors] || colors.M;
  };

  const totalPoints = estimations.reduce((sum, est) => sum + est.storyPoints, 0);
  const totalHoursMin = estimations.reduce((sum, est) => sum + est.hours.min, 0);
  const totalHoursMax = estimations.reduce((sum, est) => sum + est.hours.max, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <Calculator className="w-8 h-8" />
            Estimation & Sizing Tool
          </h1>
          <p className="text-muted-foreground mt-2">
            Estimez rapidement la complexité et le temps nécessaire pour vos fonctionnalités
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          IA
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Informations à Estimer</CardTitle>
              <CardDescription>
                Décrivez les fonctionnalités que vous souhaitez estimer
              </CardDescription>
            </div>
            <ContextSelector
              onContextSelected={(context) => {
                const contextText = `Vision: ${context.vision || 'Non spécifié'}
Objectifs: ${context.objectives.join(', ') || 'Non spécifié'}
Audience: ${context.target_audience || 'Non spécifié'}
Contraintes: ${context.constraints || 'Non spécifié'}`;
                setContext(contextText);
                
                if (context.objectives.length > 0) {
                  setFeatures(context.objectives.join('\n'));
                }
                
                toast.success('Contexte importé avec succès');
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Contexte du projet (optionnel)</label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Stack technique, contraintes, équipe..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fonctionnalités à estimer *</label>
            <Textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="Listez les fonctionnalités à estimer (une par ligne ou séparées par des virgules)...
Ex:
- Système d'authentification par email
- Dashboard avec graphiques temps réel
- Export PDF des rapports"
              rows={8}
            />
          </div>

          <Button
            onClick={generateEstimations}
            disabled={isGenerating || !features.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Estimation en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Générer les Estimations
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {estimations.length > 0 && (
        <>
          <div className="flex gap-2">
            <Button onClick={saveAsArtifact} disabled={isSaving} variant="outline">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Sauvegarder
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Résumé Global</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Zap className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{totalPoints}</p>
                  <p className="text-sm text-muted-foreground">Story Points</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{totalHoursMin}h</p>
                  <p className="text-sm text-muted-foreground">Minimum</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{totalHoursMax}h</p>
                  <p className="text-sm text-muted-foreground">Maximum</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {estimations.map((estimation, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{estimation.feature}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getComplexityColor(estimation.complexity)}>
                        {estimation.complexity}
                      </Badge>
                      <Badge variant="outline">
                        {estimation.storyPoints} points
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {estimation.hours.min}-{estimation.hours.max}h
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Confiance: {estimation.confidence}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Raisonnement</h4>
                    <p className="text-sm text-muted-foreground">{estimation.reasoning}</p>
                  </div>

                  {estimation.dependencies?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Dépendances</h4>
                      <ul className="text-sm space-y-1">
                        {estimation.dependencies.map((dep, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span className="text-muted-foreground">{dep}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {estimation.risks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Risques</h4>
                      <ul className="text-sm space-y-1">
                        {estimation.risks.map((risk, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-destructive">•</span>
                            <span className="text-muted-foreground">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
