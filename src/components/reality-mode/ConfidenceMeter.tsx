import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Gauge, 
  Users, 
  AlertTriangle, 
  BarChart3,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { ConfidenceFactors } from './types';

interface ConfidenceMeterProps {
  factors: ConfidenceFactors;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({ factors }) => {
  const getConfidenceIcon = () => {
    switch (factors.overallConfidence) {
      case 'high':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'medium':
        return <AlertCircle className="w-6 h-6 text-amber-500" />;
      case 'low':
        return <XCircle className="w-6 h-6 text-red-500" />;
    }
  };

  const getConfidenceColor = () => {
    switch (factors.overallConfidence) {
      case 'high':
        return 'bg-green-500';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-red-500';
    }
  };

  const getConfidenceLabel = () => {
    switch (factors.overallConfidence) {
      case 'high':
        return 'Confiance Haute';
      case 'medium':
        return 'Confiance Moyenne';
      case 'low':
        return 'Confiance Basse';
    }
  };

  const confidencePercentage = factors.overallConfidence === 'high' ? 85 
    : factors.overallConfidence === 'medium' ? 55 : 25;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Gauge className="w-5 h-5 text-primary" />
        <h4 className="font-semibold">Niveau de Confiance</h4>
      </div>

      {/* Main Confidence Display */}
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-full ${getConfidenceColor()}/10`}>
          {getConfidenceIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold">{getConfidenceLabel()}</span>
            <Badge 
              className={`${getConfidenceColor()} text-white`}
            >
              {confidencePercentage}%
            </Badge>
          </div>
          <Progress value={confidencePercentage} className="h-2" />
        </div>
      </div>

      {/* Confidence Factors */}
      <div className="space-y-3 pt-3 border-t">
        <p className="text-xs font-medium text-muted-foreground uppercase">Facteurs</p>

        {/* Role Alignment */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm">Alignement des rôles</span>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={factors.roleAlignment} className="w-20 h-1.5" />
            <span className="text-xs text-muted-foreground w-8">{factors.roleAlignment}%</span>
          </div>
        </div>

        {/* Unresolved Tensions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm">Tensions non résolues</span>
          </div>
          <Badge 
            variant="outline" 
            className={factors.unresolvedTensions > 3 ? 'border-red-500 text-red-500' : ''}
          >
            {factors.unresolvedTensions}
          </Badge>
        </div>

        {/* Data vs Opinion */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-green-500" />
            <span className="text-sm">Ratio Données/Opinions</span>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={factors.dataVsOpinionRatio} className="w-20 h-1.5" />
            <span className="text-xs text-muted-foreground w-8">{factors.dataVsOpinionRatio}%</span>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground italic">
          {factors.explanation}
        </p>
      </div>

      {/* Warning for low confidence */}
      {factors.overallConfidence === 'low' && (
        <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Décision possible mais incertitude élevée. Considérez des validations supplémentaires avant implémentation.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};
