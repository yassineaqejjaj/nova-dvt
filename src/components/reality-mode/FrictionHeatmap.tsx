import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Flame, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import { FrictionPattern } from './types';

interface FrictionHeatmapProps {
  userId?: string;
}

export const FrictionHeatmap: React.FC<FrictionHeatmapProps> = ({ userId }) => {
  const [patterns, setPatterns] = useState<FrictionPattern[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('friction_patterns')
        .select('*')
        .order('occurrence_count', { ascending: false })
        .limit(10);

      if (error) throw error;

      setPatterns(
        (data || []).map((p) => ({
          id: p.id,
          tensionSignature: p.tension_signature,
          tensionLeft: p.tension_left,
          tensionRight: p.tension_right,
          occurrenceCount: p.occurrence_count ?? 0,
          decisionIds: p.decision_ids as string[],
          isStructural: p.is_structural ?? false,
          resolutionRate: Number(p.resolution_rate),
        }))
      );
    } catch (error) {
      console.error('Error loading friction patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHeatColor = (count: number) => {
    if (count >= 7) return 'bg-red-500';
    if (count >= 5) return 'bg-orange-500';
    if (count >= 3) return 'bg-amber-500';
    return 'bg-yellow-500';
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-primary" />
        <h4 className="font-semibold">Carte des Frictions</h4>
        <Badge variant="outline" className="text-xs">
          Cross-débats
        </Badge>
      </div>

      {patterns.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Flame className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Pas encore assez de débats</p>
          <p className="text-xs">Les patterns apparaîtront après plusieurs arènes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {patterns.map((pattern) => (
            <div
              key={pattern.id}
              className={`p-3 rounded-lg border ${pattern.isStructural ? 'border-red-500/50 bg-red-500/5' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${getHeatColor(pattern.occurrenceCount)}`}
                  />
                  <span className="text-sm font-medium">{pattern.tensionLeft}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm font-medium">{pattern.tensionRight}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {pattern.occurrenceCount} débats
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Taux de résolution</span>
                <div className="flex items-center gap-2">
                  <Progress value={pattern.resolutionRate * 100} className="w-16 h-1.5" />
                  <span>{Math.round(pattern.resolutionRate * 100)}%</span>
                </div>
              </div>

              {pattern.isStructural && (
                <div className="mt-2 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Problème structurel détecté - nécessite une décision de fond</span>
                </div>
              )}
            </div>
          ))}

          {patterns.some((p) => p.isStructural) && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Tensions structurelles détectées
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ces tensions réapparaissent dans plusieurs débats. Elles nécessitent une
                    décision stratégique de fond, pas un compromis.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
