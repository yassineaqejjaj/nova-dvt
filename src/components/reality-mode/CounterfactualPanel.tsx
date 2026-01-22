import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  GitBranch, 
  Users, 
  Frown, 
  ShieldAlert,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { DecisionOption, CounterfactualAnalysis } from './types';
import { FormattedText } from '../ui/formatted-text';

interface CounterfactualPanelProps {
  chosenOption: DecisionOption;
  alternativeOptions: DecisionOption[];
  debateContext: string;
  onAnalysisComplete: (analysis: CounterfactualAnalysis) => void;
}

export const CounterfactualPanel: React.FC<CounterfactualPanelProps> = ({
  chosenOption,
  alternativeOptions,
  debateContext,
  onAnalysisComplete
}) => {
  const [analysis, setAnalysis] = useState<CounterfactualAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAlternative, setSelectedAlternative] = useState<DecisionOption | null>(null);

  const generateCounterfactual = async (alternative: DecisionOption) => {
    setLoading(true);
    setSelectedAlternative(alternative);

    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Contexte du débat: ${debateContext}

Option choisie: ${chosenOption.title}
- ${chosenOption.description}
- Ce qui change: ${chosenOption.whatChanges.join(', ')}

Option alternative (non choisie): ${alternative.title}
- ${alternative.description}
- Ce qui changerait: ${alternative.whatChanges.join(', ')}

Génère une analyse contrefactuelle: "Si nous avions choisi l'Option B au lieu de A, qu'est-ce qui casserait en premier?"`,
          systemPrompt: `Tu es un analyste stratégique. Génère une analyse contrefactuelle RÉALISTE, pas de la prédiction théâtrale.

FORMAT JSON OBLIGATOIRE:
{
  "advisorLoadImpact": "Impact concret sur la charge des conseillers (1-2 phrases)",
  "clientFrictionImpact": "Friction client probable (1-2 phrases)",
  "brandRiskImpact": "Risque pour l'image de marque (1-2 phrases)",
  "whatWouldBreakFirst": [
    "Premier point de rupture probable",
    "Deuxième risque immédiat",
    "Troisième conséquence"
  ]
}

Sois direct et concret. Pas de conditionnel excessif.`
        }
      });

      if (error) throw error;

      const jsonMatch = data.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const result: CounterfactualAnalysis = {
          chosenOption: chosenOption.title,
          alternativeOption: alternative.title,
          ...parsed
        };
        setAnalysis(result);
        onAnalysisComplete(result);
      }
    } catch (error) {
      console.error('Error generating counterfactual:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'analyse contrefactuelle",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-5 h-5 text-primary" />
        <h4 className="font-semibold">Mode Contrefactuel</h4>
        <Badge variant="outline" className="text-xs">Et si...?</Badge>
      </div>

      {!analysis ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Analyser ce qui casserait si on avait choisi une autre option
          </p>

          <div className="grid gap-2">
            {alternativeOptions.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={() => generateCounterfactual(option)}
                disabled={loading}
              >
                {loading && selectedAlternative?.id === option.id ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <GitBranch className="w-4 h-4 mr-2" />
                )}
                <div className="text-left">
                  <p className="font-medium text-sm">Et si: {option.title}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                    {option.description}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm">
              <strong>Choix actuel:</strong> {analysis.chosenOption}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Alternative analysée:</strong> {analysis.alternativeOption}
            </p>
          </div>

          <div className="grid gap-3">
            {/* Advisor Load */}
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                <Users className="w-4 h-4" />
                <span className="font-medium text-sm">Charge Conseiller</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {analysis.advisorLoadImpact}
              </p>
            </div>

            {/* Client Friction */}
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                <Frown className="w-4 h-4" />
                <span className="font-medium text-sm">Friction Client</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {analysis.clientFrictionImpact}
              </p>
            </div>

            {/* Brand Risk */}
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                <ShieldAlert className="w-4 h-4" />
                <span className="font-medium text-sm">Risque Marque</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {analysis.brandRiskImpact}
              </p>
            </div>

            {/* What Would Break First */}
            <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium text-sm">Ce qui casserait en premier</span>
              </div>
              <ul className="space-y-1">
                {analysis.whatWouldBreakFirst.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-red-500 font-bold">{i + 1}.</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setAnalysis(null)}
            className="w-full"
          >
            Analyser une autre option
          </Button>
        </div>
      )}
    </Card>
  );
};
