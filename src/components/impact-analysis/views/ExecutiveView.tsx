import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ImpactRun, ImpactItem } from '../types';
import {
  AlertTriangle, Zap, BarChart3, Shield, TrendingUp,
  Code2, TestTube2, Database, Target, FileText,
} from 'lucide-react';

interface ExecutiveViewProps {
  run: ImpactRun;
  items: ImpactItem[];
}

export const ExecutiveView: React.FC<ExecutiveViewProps> = ({ run, items }) => {
  const riskLevel = run.impact_score >= 15 ? 'Critique' : run.impact_score >= 8 ? 'Élevé' : run.impact_score >= 3 ? 'Modéré' : 'Faible';
  const riskColor = run.impact_score >= 15 ? 'text-destructive' : run.impact_score >= 8 ? 'text-amber-500' : run.impact_score >= 3 ? 'text-yellow-500' : 'text-emerald-500';
  const riskBg = run.impact_score >= 15 ? 'bg-destructive/10' : run.impact_score >= 8 ? 'bg-amber-500/10' : run.impact_score >= 3 ? 'bg-yellow-500/10' : 'bg-emerald-500/10';

  const reviewRequired = items.filter(i => i.review_status === 'review_required').length;
  const reviewed = items.filter(i => i.review_status === 'reviewed').length;
  const progressPercent = items.length > 0 ? Math.round((reviewed / items.length) * 100) : 0;

  const zoneCounts = {
    documentation: items.filter(i => ['documentation', 'backlog', 'spec'].includes(i.item_type)).length,
    technical: items.filter(i => ['code', 'test'].includes(i.item_type)).length,
    data: items.filter(i => ['data', 'kpi'].includes(i.item_type)).length,
  };

  const highSeverityItems = items.filter(i => i.impact_score >= 4);

  return (
    <div className="space-y-6">
      {/* Risk overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`${riskBg} border-2`}>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className={`w-10 h-10 mx-auto mb-2 ${riskColor}`} />
              <p className={`text-3xl font-bold ${riskColor}`}>{run.impact_score}</p>
              <p className="text-sm font-medium mt-1">Score Global</p>
              <Badge className={`mt-2 ${riskBg} ${riskColor} border-current/20`}>{riskLevel}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="w-10 h-10 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold">{run.summary?.total_changes || 0}</p>
              <p className="text-sm font-medium mt-1">Changements Détectés</p>
              <p className="text-xs text-muted-foreground mt-1">
                {run.summary?.high_severity_count || 0} haute sévérité
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-10 h-10 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold">{items.length}</p>
              <p className="text-sm font-medium mt-1">Éléments Impactés</p>
              <p className="text-xs text-muted-foreground mt-1">
                {reviewRequired} à revoir
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Progression de la revue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={progressPercent} className="flex-1" />
            <span className="text-sm font-medium w-12 text-right">{progressPercent}%</span>
          </div>
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span>{reviewed} revus</span>
            <span>{reviewRequired} à revoir</span>
            <span>{items.filter(i => i.review_status === 'ignored').length} ignorés</span>
            <span>{items.filter(i => i.review_status === 'pending').length} en attente</span>
          </div>
        </CardContent>
      </Card>

      {/* Zones critiques */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Zones Critiques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <FileText className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xl font-bold">{zoneCounts.documentation}</p>
              <p className="text-xs text-muted-foreground">Documentation</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <Code2 className="w-6 h-6 mx-auto mb-1 text-blue-500" />
              <p className="text-xl font-bold">{zoneCounts.technical}</p>
              <p className="text-xs text-muted-foreground">Technique</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <Database className="w-6 h-6 mx-auto mb-1 text-purple-500" />
              <p className="text-xl font-bold">{zoneCounts.data}</p>
              <p className="text-xs text-muted-foreground">Données & KPIs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High severity alerts */}
      {highSeverityItems.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              Alertes Haute Sévérité ({highSeverityItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {highSeverityItems.slice(0, 5).map(item => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-destructive/5 border border-destructive/10">
                  <Badge variant="destructive" className="text-xs shrink-0">Critique</Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.item_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.impact_reason}</p>
                  </div>
                </div>
              ))}
              {highSeverityItems.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  + {highSeverityItems.length - 5} autres alertes
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Type breakdown */}
      {run.summary?.type_breakdown && Object.keys(run.summary.type_breakdown).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Répartition des changements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(run.summary.type_breakdown).map(([type, count]) => (
                <Badge key={type} variant="outline" className="py-1 px-3">
                  {type.replace(/_/g, ' ')} × {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
