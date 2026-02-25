import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertTriangle, CheckCircle2, Clock, ArrowRight, Activity,
  TrendingUp, TrendingDown, Minus, BarChart3
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FeedEntry {
  id: string;
  artefact_id: string;
  artefact_title: string;
  artefact_type: string;
  impact_score: number;
  total_items: number;
  high_severity: number;
  status: string;
  created_at: string;
}

interface ImpactFeedProps {
  onNavigateToRun?: (artefactId: string) => void;
  compact?: boolean;
}

export const ImpactFeed: React.FC<ImpactFeedProps> = ({ onNavigateToRun, compact = false }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadFeed();
  }, [user?.id]);

  // Realtime subscription for new completed runs
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('impact-feed')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'impact_runs',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        loadFeed();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const loadFeed = async () => {
    setLoading(true);
    const { data: runs } = await supabase
      .from('impact_runs')
      .select('id, artefact_id, impact_score, summary, status, created_at')
      .eq('user_id', user!.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(compact ? 5 : 20);

    if (!runs || runs.length === 0) {
      setEntries([]);
      setLoading(false);
      return;
    }

    // Fetch artifact titles
    const artefactIds = [...new Set(runs.map(r => r.artefact_id))];
    const { data: artifacts } = await supabase
      .from('artifacts')
      .select('id, title, artifact_type')
      .in('id', artefactIds);

    const artMap = new Map((artifacts || []).map(a => [a.id, a]));

    const feedEntries: FeedEntry[] = runs.map(run => {
      const art = artMap.get(run.artefact_id);
      const summary = run.summary as any || {};
      return {
        id: run.id,
        artefact_id: run.artefact_id,
        artefact_title: art?.title || 'Artefact inconnu',
        artefact_type: art?.artifact_type || 'unknown',
        impact_score: run.impact_score || 0,
        total_items: summary.total_changes || 0,
        high_severity: summary.high_severity_count || 0,
        status: run.status,
        created_at: run.created_at,
      };
    });

    setEntries(feedEntries);
    setLoading(false);
  };

  const getSeverityColor = (score: number) => {
    if (score >= 15) return 'text-destructive';
    if (score >= 8) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getSeverityBg = (score: number) => {
    if (score >= 15) return 'bg-destructive/10 border-destructive/20';
    if (score >= 8) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-emerald-500/10 border-emerald-500/20';
  };

  const getSeverityIcon = (score: number) => {
    if (score >= 15) return <AlertTriangle className="w-4 h-4 text-destructive" />;
    if (score >= 8) return <Clock className="w-4 h-4 text-amber-500" />;
    return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Activity className="w-5 h-5 animate-pulse mx-auto mb-2" />
          <p className="text-sm">Chargement du fil d'impacts…</p>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">Aucune analyse récente</p>
          <p className="text-xs mt-1">Les impacts apparaîtront ici automatiquement</p>
        </CardContent>
      </Card>
    );
  }

  // Trend: compare avg of last 5 vs previous 5
  const recentScores = entries.slice(0, 5).map(e => e.impact_score);
  const olderScores = entries.slice(5, 10).map(e => e.impact_score);
  const avgRecent = recentScores.length ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : 0;
  const avgOlder = olderScores.length ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length : 0;
  const trend = olderScores.length === 0 ? 'neutral' : avgRecent > avgOlder ? 'up' : avgRecent < avgOlder ? 'down' : 'neutral';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Fil d'Impacts
          </CardTitle>
          <div className="flex items-center gap-2">
            {trend === 'up' && (
              <Badge variant="outline" className="text-destructive border-destructive/30">
                <TrendingUp className="w-3 h-3 mr-1" /> En hausse
              </Badge>
            )}
            {trend === 'down' && (
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
                <TrendingDown className="w-3 h-3 mr-1" /> En baisse
              </Badge>
            )}
            {trend === 'neutral' && (
              <Badge variant="outline" className="text-muted-foreground">
                <Minus className="w-3 h-3 mr-1" /> Stable
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className={compact ? 'max-h-[300px]' : 'max-h-[500px]'}>
          <div className="space-y-2">
            {entries.map(entry => (
              <div
                key={entry.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors ${getSeverityBg(entry.impact_score)}`}
                onClick={() => onNavigateToRun?.(entry.artefact_id)}
              >
                {getSeverityIcon(entry.impact_score)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{entry.artefact_title}</span>
                    <Badge variant="outline" className="text-xs shrink-0">{entry.artefact_type}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    <span>{entry.total_items} changement{entry.total_items > 1 ? 's' : ''}</span>
                    {entry.high_severity > 0 && (
                      <span className="text-destructive font-medium">{entry.high_severity} critique{entry.high_severity > 1 ? 's' : ''}</span>
                    )}
                    <span>{formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: fr })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-lg font-bold ${getSeverityColor(entry.impact_score)}`}>
                    {entry.impact_score}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
