import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { ImpactRun, ImpactItem } from './types';
import {
  ArrowUpRight, ArrowDownRight, Minus, GitCompare, TrendingUp, TrendingDown
} from 'lucide-react';

interface ImpactDiffViewProps {
  runs: ImpactRun[];
  artefactId: string;
}

export const ImpactDiffView: React.FC<ImpactDiffViewProps> = ({ runs, artefactId }) => {
  const [runA, setRunA] = useState<string>(runs[1]?.id || '');
  const [runB, setRunB] = useState<string>(runs[0]?.id || '');
  const [itemsA, setItemsA] = useState<ImpactItem[]>([]);
  const [itemsB, setItemsB] = useState<ImpactItem[]>([]);

  useEffect(() => {
    if (runA) loadItems(runA, setItemsA);
    if (runB) loadItems(runB, setItemsB);
  }, [runA, runB]);

  const loadItems = async (runId: string, setter: React.Dispatch<React.SetStateAction<ImpactItem[]>>) => {
    const { data } = await supabase
      .from('impact_items')
      .select('*')
      .eq('impact_run_id', runId)
      .order('impact_score', { ascending: false });
    setter((data || []) as unknown as ImpactItem[]);
  };

  const selectedRunA = runs.find(r => r.id === runA);
  const selectedRunB = runs.find(r => r.id === runB);

  // Compute diff
  const itemKeyB = new Set(itemsB.map(i => `${i.item_type}:${i.item_name}`));
  const itemKeyA = new Set(itemsA.map(i => `${i.item_type}:${i.item_name}`));

  const newImpacts = itemsB.filter(i => !itemKeyA.has(`${i.item_type}:${i.item_name}`));
  const resolvedImpacts = itemsA.filter(i => !itemKeyB.has(`${i.item_type}:${i.item_name}`));
  const persistedImpacts = itemsB.filter(i => itemKeyA.has(`${i.item_type}:${i.item_name}`));

  const scoreDelta = (selectedRunB?.impact_score || 0) - (selectedRunA?.impact_score || 0);

  if (runs.length < 2) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <GitCompare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">Comparaison indisponible</p>
          <p className="text-xs mt-1">Il faut au moins 2 analyses pour comparer</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Run selectors */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Avant (ancienne)</Label>
          <Select value={runA} onValueChange={setRunA}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {runs.map(r => (
                <SelectItem key={r.id} value={r.id}>
                  {new Date(r.created_at).toLocaleString('fr-FR')} — Score: {r.impact_score}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <GitCompare className="w-5 h-5 text-muted-foreground mb-2" />
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Après (récente)</Label>
          <Select value={runB} onValueChange={setRunB}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {runs.map(r => (
                <SelectItem key={r.id} value={r.id}>
                  {new Date(r.created_at).toLocaleString('fr-FR')} — Score: {r.impact_score}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Score delta */}
      <Card className={scoreDelta > 0 ? 'border-destructive/20 bg-destructive/5' : scoreDelta < 0 ? 'border-emerald-500/20 bg-emerald-500/5' : ''}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {scoreDelta > 0 ? (
                <TrendingUp className="w-5 h-5 text-destructive" />
              ) : scoreDelta < 0 ? (
                <TrendingDown className="w-5 h-5 text-emerald-500" />
              ) : (
                <Minus className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-sm">
                  {scoreDelta > 0 ? 'Risque accru' : scoreDelta < 0 ? 'Risque réduit' : 'Stable'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Score {selectedRunA?.impact_score} → {selectedRunB?.impact_score}
                </p>
              </div>
            </div>
            <span className={`text-2xl font-bold ${scoreDelta > 0 ? 'text-destructive' : scoreDelta < 0 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
              {scoreDelta > 0 ? '+' : ''}{scoreDelta}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Diff categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <ArrowUpRight className="w-4 h-4" />
              Nouveaux ({newImpacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {newImpacts.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Aucun nouveau</p>
            ) : (
              <div className="space-y-1.5">
                {newImpacts.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-destructive/5">
                    <span className="truncate">{item.item_name}</span>
                    <Badge variant="outline" className="text-[10px] shrink-0">{item.item_type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-500">
              <ArrowDownRight className="w-4 h-4" />
              Résolus ({resolvedImpacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resolvedImpacts.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Aucun résolu</p>
            ) : (
              <div className="space-y-1.5">
                {resolvedImpacts.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-emerald-500/5">
                    <span className="truncate">{item.item_name}</span>
                    <Badge variant="outline" className="text-[10px] shrink-0">{item.item_type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <Minus className="w-4 h-4" />
              Persistants ({persistedImpacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {persistedImpacts.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Aucun</p>
            ) : (
              <div className="space-y-1.5">
                {persistedImpacts.slice(0, 8).map(item => (
                  <div key={item.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/30">
                    <span className="truncate">{item.item_name}</span>
                    <Badge variant="outline" className="text-[10px] shrink-0">{item.item_type}</Badge>
                  </div>
                ))}
                {persistedImpacts.length > 8 && (
                  <p className="text-xs text-muted-foreground text-center">+{persistedImpacts.length - 8} autres</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
