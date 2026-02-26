import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImpactRun, ImpactItem } from '../types';
import { FormattedText } from '@/components/ui/formatted-text';
import {
  AlertTriangle, FileText, Code2, Database, TestTube2,
  ChevronDown, ChevronUp, Eye, EyeOff, CheckCircle2, Clock,
  Filter, BarChart3, Target,
} from 'lucide-react';

interface ChangesOverviewProps {
  run: ImpactRun;
  items: ImpactItem[];
  onUpdateStatus?: (itemId: string, status: string) => void;
}

const typeConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  documentation: { icon: <FileText className="w-4 h-4" />, label: 'Documentation', color: 'text-amber-600' },
  backlog: { icon: <Target className="w-4 h-4" />, label: 'Backlog', color: 'text-blue-600' },
  spec: { icon: <FileText className="w-4 h-4" />, label: 'Spécification', color: 'text-indigo-600' },
  test: { icon: <TestTube2 className="w-4 h-4" />, label: 'Test', color: 'text-emerald-600' },
  code: { icon: <Code2 className="w-4 h-4" />, label: 'Code', color: 'text-cyan-600' },
  kpi: { icon: <BarChart3 className="w-4 h-4" />, label: 'KPI', color: 'text-purple-600' },
  data: { icon: <Database className="w-4 h-4" />, label: 'Donnée', color: 'text-rose-600' },
};

const severityBadge = (score: number) => {
  if (score >= 4) return <Badge variant="destructive" className="text-xs">Critique</Badge>;
  if (score >= 3) return <Badge className="text-xs bg-amber-500/15 text-amber-700 border-amber-300">Élevé</Badge>;
  if (score >= 2) return <Badge className="text-xs bg-yellow-500/15 text-yellow-700 border-yellow-300">Modéré</Badge>;
  return <Badge variant="outline" className="text-xs">Faible</Badge>;
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pending: { label: 'En attente', icon: <Clock className="w-3 h-3" />, className: 'text-muted-foreground' },
  review_required: { label: 'À revoir', icon: <AlertTriangle className="w-3 h-3" />, className: 'text-amber-600' },
  reviewed: { label: 'Revu', icon: <CheckCircle2 className="w-3 h-3" />, className: 'text-emerald-600' },
  ignored: { label: 'Ignoré', icon: <EyeOff className="w-3 h-3" />, className: 'text-muted-foreground' },
};

export const ChangesOverview: React.FC<ChangesOverviewProps> = ({ run, items, onUpdateStatus }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedItems(new Set(items.map(i => i.id)));
  const collapseAll = () => setExpandedItems(new Set());

  let filtered = items;
  if (filterType) filtered = filtered.filter(i => i.item_type === filterType);
  if (filterSeverity === 'high') filtered = filtered.filter(i => i.impact_score >= 4);
  else if (filterSeverity === 'medium') filtered = filtered.filter(i => i.impact_score >= 2 && i.impact_score < 4);
  else if (filterSeverity === 'low') filtered = filtered.filter(i => i.impact_score < 2);

  // Group by type
  const grouped = filtered.reduce<Record<string, ImpactItem[]>>((acc, item) => {
    const key = item.item_type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const typeKeys = Object.keys(grouped).sort((a, b) => {
    const maxA = Math.max(...grouped[a].map(i => i.impact_score));
    const maxB = Math.max(...grouped[b].map(i => i.impact_score));
    return maxB - maxA;
  });

  // Summary stats
  const totalChanges = run.summary?.total_changes || items.length;
  const highCount = items.filter(i => i.impact_score >= 4).length;
  const medCount = items.filter(i => i.impact_score >= 2 && i.impact_score < 4).length;
  const lowCount = items.filter(i => i.impact_score < 2).length;

  return (
    <div className="space-y-4">
      {/* Summary banner */}
      <Card className="bg-muted/30">
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium">
                <span className="text-2xl font-bold mr-2">{totalChanges}</span>
                changement{totalChanges > 1 ? 's' : ''} détecté{totalChanges > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Analyse du {new Date(run.created_at).toLocaleString('fr-FR')} — Score global : {run.impact_score}
              </p>
            </div>
            <div className="flex gap-3">
              {highCount > 0 && (
                <button
                  onClick={() => setFilterSeverity(filterSeverity === 'high' ? 'all' : 'high')}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border transition-colors ${filterSeverity === 'high' ? 'bg-destructive/10 border-destructive/30 text-destructive' : 'border-border hover:bg-muted'}`}
                >
                  <AlertTriangle className="w-3 h-3" /> {highCount} critique{highCount > 1 ? 's' : ''}
                </button>
              )}
              {medCount > 0 && (
                <button
                  onClick={() => setFilterSeverity(filterSeverity === 'medium' ? 'all' : 'medium')}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border transition-colors ${filterSeverity === 'medium' ? 'bg-amber-500/10 border-amber-300 text-amber-700' : 'border-border hover:bg-muted'}`}
                >
                  {medCount} modéré{medCount > 1 ? 's' : ''}
                </button>
              )}
              {lowCount > 0 && (
                <button
                  onClick={() => setFilterSeverity(filterSeverity === 'low' ? 'all' : 'low')}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border transition-colors ${filterSeverity === 'low' ? 'bg-muted border-border' : 'border-border hover:bg-muted'}`}
                >
                  {lowCount} faible{lowCount > 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1.5 flex-wrap">
          <Button
            variant={filterType === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType(null)}
          >
            Tous ({items.length})
          </Button>
          {Object.entries(typeConfig).map(([key, cfg]) => {
            const count = items.filter(i => i.item_type === key).length;
            if (count === 0) return null;
            return (
              <Button
                key={key}
                variant={filterType === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(filterType === key ? null : key)}
              >
                {cfg.icon}
                <span className="ml-1.5">{cfg.label} ({count})</span>
              </Button>
            );
          })}
        </div>
        <div className="flex gap-1.5">
          <Button variant="ghost" size="sm" onClick={expandAll}>
            <Eye className="w-3.5 h-3.5 mr-1" /> Tout ouvrir
          </Button>
          <Button variant="ghost" size="sm" onClick={collapseAll}>
            <EyeOff className="w-3.5 h-3.5 mr-1" /> Tout fermer
          </Button>
        </div>
      </div>

      {/* Changes list grouped by type */}
      {typeKeys.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Filter className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>Aucun changement ne correspond aux filtres sélectionnés.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {typeKeys.map(typeKey => {
            const cfg = typeConfig[typeKey] || { icon: <FileText className="w-4 h-4" />, label: typeKey, color: 'text-muted-foreground' };
            const groupItems = grouped[typeKey];

            return (
              <Card key={typeKey}>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className={cfg.color}>{cfg.icon}</span>
                    {cfg.label}
                    <Badge variant="secondary" className="text-xs ml-1">{groupItems.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-1.5">
                    {groupItems.map(item => {
                      const isExpanded = expandedItems.has(item.id);
                      const status = statusConfig[item.review_status] || statusConfig.pending;

                      return (
                        <div
                          key={item.id}
                          className="border rounded-lg overflow-hidden transition-colors hover:bg-muted/30"
                        >
                          {/* Header row */}
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className="w-full flex items-center gap-3 p-3 text-left"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.item_name}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`flex items-center gap-1 text-xs ${status.className}`}>
                                {status.icon} {status.label}
                              </span>
                              {severityBadge(item.impact_score)}
                            </div>
                          </button>

                          {/* Expanded detail */}
                          {isExpanded && (
                            <div className="px-3 pb-3 pt-0 border-t bg-muted/10">
                              <div className="pt-3 space-y-3">
                                {/* Impact reason / summary */}
                                {item.impact_reason && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Résumé de l'impact</p>
                                    <div className="text-sm bg-background rounded-md p-3 border">
                                      <FormattedText content={item.impact_reason} />
                                    </div>
                                  </div>
                                )}

                                {/* Metadata details */}
                                {item.metadata && Object.keys(item.metadata).length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Détails</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {Object.entries(item.metadata).map(([k, v]) => (
                                        <Badge key={k} variant="outline" className="text-xs">
                                          {k}: {typeof v === 'string' ? v : JSON.stringify(v)}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Related artifact */}
                                {item.related_artefact_id && (
                                  <p className="text-xs text-muted-foreground">
                                    Artefact lié : <code className="bg-muted px-1 py-0.5 rounded text-xs">{item.related_artefact_id.slice(0, 8)}…</code>
                                  </p>
                                )}

                                {/* Actions */}
                                {onUpdateStatus && (
                                  <div className="flex gap-2 pt-1">
                                    {item.review_status !== 'reviewed' && (
                                      <Button size="sm" variant="outline" onClick={() => onUpdateStatus(item.id, 'reviewed')}>
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Marquer comme revu
                                      </Button>
                                    )}
                                    {item.review_status !== 'ignored' && (
                                      <Button size="sm" variant="ghost" onClick={() => onUpdateStatus(item.id, 'ignored')}>
                                        <EyeOff className="w-3.5 h-3.5 mr-1" /> Ignorer
                                      </Button>
                                    )}
                                    {(item.review_status === 'reviewed' || item.review_status === 'ignored') && (
                                      <Button size="sm" variant="ghost" onClick={() => onUpdateStatus(item.id, 'review_required')}>
                                        <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Remettre à revoir
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Type breakdown from run summary */}
      {run.summary?.type_breakdown && Object.keys(run.summary.type_breakdown).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Répartition par catégorie</CardTitle>
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
