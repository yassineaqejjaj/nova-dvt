import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart3,
  ArrowRight,
  GitFork,
  Handshake,
  Target
} from 'lucide-react';
import { DebateOutcome, DecisionOption, ConfidenceFactors } from './types';

interface SilentModeViewProps {
  debateTopic: string;
  outcome: DebateOutcome;
  chosenOption?: DecisionOption;
  confidenceFactors: ConfidenceFactors;
  onExitSilentMode: () => void;
  onCreateArtifact: (type: 'discovery' | 'epic' | 'journey' | 'kpis') => void;
}

export const SilentModeView: React.FC<SilentModeViewProps> = ({
  debateTopic,
  outcome,
  chosenOption,
  confidenceFactors,
  onExitSilentMode,
  onCreateArtifact
}) => {
  const getConfidenceBadge = () => {
    switch (confidenceFactors.overallConfidence) {
      case 'high':
        return <Badge className="bg-green-500 text-white">Confiance Haute</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500 text-white">Confiance Moyenne</Badge>;
      case 'low':
        return <Badge className="bg-red-500 text-white">Confiance Basse</Badge>;
    }
  };

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">Mode Exécutif</h3>
          <Badge variant="outline">Synthèse</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={onExitSilentMode}>
          Voir le débat complet
        </Button>
      </div>

      {/* Topic */}
      <Card className="p-4 bg-primary/5">
        <p className="text-sm text-muted-foreground">Question débattue</p>
        <p className="font-semibold">{debateTopic}</p>
      </Card>

      {/* Decision */}
      {chosenOption && (
        <Card className="p-4 border-2 border-primary/30">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="font-bold">Décision</span>
            </div>
            {getConfidenceBadge()}
          </div>
          
          <h4 className="text-lg font-bold mb-2">{chosenOption.title}</h4>
          <p className="text-sm text-muted-foreground mb-4">{chosenOption.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-green-600 dark:text-green-400 mb-1">Ce qui change</p>
              <ul className="space-y-1">
                {chosenOption.whatChanges.map((item, i) => (
                  <li key={i} className="text-muted-foreground">• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-blue-600 dark:text-blue-400 mb-1">Ce qui reste humain</p>
              <ul className="space-y-1">
                {chosenOption.whatStaysHuman.map((item, i) => (
                  <li key={i} className="text-muted-foreground">• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Consensus */}
        <Card className="p-3">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
            <Handshake className="w-4 h-4" />
            <span className="font-medium text-sm">Consensus</span>
          </div>
          <ul className="space-y-1">
            {outcome.consensus.slice(0, 3).map((item, i) => (
              <li key={i} className="text-xs text-muted-foreground">• {item}</li>
            ))}
          </ul>
        </Card>

        {/* Tensions */}
        <Card className="p-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
            <GitFork className="w-4 h-4" />
            <span className="font-medium text-sm">Tensions</span>
          </div>
          <ul className="space-y-1">
            {outcome.tensions.slice(0, 3).map((t, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                {t.left} <ArrowRight className="w-2 h-2" /> {t.right}
              </li>
            ))}
          </ul>
        </Card>

        {/* Risk */}
        <Card className="p-3">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium text-sm">Risque principal</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {chosenOption?.keyRisk || outcome.nonNegotiables[0] || 'Non identifié'}
          </p>
        </Card>
      </div>

      {/* KPIs */}
      {chosenOption?.suggestedKPIs && chosenOption.suggestedKPIs.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="font-medium">KPIs à suivre</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {chosenOption.suggestedKPIs.map((kpi, i) => (
              <Badge key={i} variant="secondary">📊 {kpi}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Next Step */}
      <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-primary" />
          <span className="font-medium">Prochaine étape</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => onCreateArtifact('epic')}>
            Créer Epic
          </Button>
          <Button size="sm" variant="outline" onClick={() => onCreateArtifact('kpis')}>
            Définir KPIs
          </Button>
          <Button size="sm" variant="outline" onClick={() => onCreateArtifact('journey')}>
            Parcours Conseiller
          </Button>
        </div>
      </Card>
    </div>
  );
};
