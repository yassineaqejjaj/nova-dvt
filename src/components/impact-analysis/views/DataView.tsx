import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImpactItem, FeatureDataMap } from '../types';
import {
  Database, Target, Plus, Trash2, Eye,
  CheckCircle2, XCircle, AlertTriangle, BarChart3,
} from 'lucide-react';

interface DataViewProps {
  items: ImpactItem[];
  dataMaps: FeatureDataMap[];
  selectedArtifact: string;
  userId: string;
  onUpdateStatus: (itemId: string, status: string) => void;
  onDataMapsChange: () => void;
}

export const DataView: React.FC<DataViewProps> = ({
  items, dataMaps, selectedArtifact, userId, onUpdateStatus, onDataMapsChange,
}) => {
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [dataForm, setDataForm] = useState({
    tableName: '', eventName: '', kpiName: '', confidence: '0.7',
  });

  const dataItems = items.filter(i => i.item_type === 'data');
  const kpiItems = items.filter(i => i.item_type === 'kpi');

  const addDataMapping = async () => {
    if (!userId || !selectedArtifact || !dataForm.tableName) return;
    try {
      await supabase.from('feature_data_map' as any).insert({
        feature_id: selectedArtifact,
        table_name: dataForm.tableName,
        event_name: dataForm.eventName || null,
        kpi_name: dataForm.kpiName || null,
        confidence: parseFloat(dataForm.confidence) || 0.7,
        link_source: 'manual',
        user_id: userId,
      } as any);
      toast.success('Mapping données ajouté');
      setShowDataDialog(false);
      setDataForm({ tableName: '', eventName: '', kpiName: '', confidence: '0.7' });
      onDataMapsChange();
    } catch {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const removeDataMap = async (id: string) => {
    await supabase.from('feature_data_map' as any).delete().eq('id', id);
    toast.success('Mapping supprimé');
    onDataMapsChange();
  };

  const getSeverityBadge = (score: number) => {
    if (score >= 4) return <Badge variant="destructive">Critique</Badge>;
    if (score >= 2) return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Modéré</Badge>;
    return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Faible</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Data mappings management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="w-4 h-4" />
              Tables & KPIs Liés ({dataMaps.length})
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowDataDialog(true)}>
              <Plus className="w-3 h-3 mr-1" />
              Ajouter
            </Button>
          </div>
          <CardDescription>Tables de données, événements et KPIs liés à cet artefact</CardDescription>
        </CardHeader>
        <CardContent>
          {dataMaps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune donnée liée</p>
              <p className="text-xs mt-1">Ajoutez des tables/KPIs pour tracer l'impact sur les données</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[250px]">
              <div className="space-y-2">
                {dataMaps.map(dm => (
                  <div key={dm.id} className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Database className="w-4 h-4 text-purple-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-mono truncate">{dm.table_name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {dm.event_name && <Badge variant="outline" className="text-xs">📊 {dm.event_name}</Badge>}
                          {dm.kpi_name && <Badge variant="outline" className="text-xs">🎯 {dm.kpi_name}</Badge>}
                          <span className="text-xs text-muted-foreground">
                            Confiance: {Math.round((dm.confidence || 0) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => removeDataMap(dm.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Data impact items */}
      {dataItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-500" />
              Tables Impactées ({dataItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2">
                {dataItems.map(item => (
                  <Collapsible key={item.id}>
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Database className="w-4 h-4 text-purple-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-mono font-medium truncate">{item.item_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.impact_reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {getSeverityBadge(item.impact_score)}
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onUpdateStatus(item.id, 'reviewed')}>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onUpdateStatus(item.id, 'ignored')}>
                            <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                    <CollapsibleContent className="px-3 pb-3">
                      <div className="mt-2 p-3 bg-muted/30 rounded-lg text-sm space-y-1">
                        {item.metadata?.impact_type && <div><span className="font-medium">Type :</span> {item.metadata.impact_type}</div>}
                        {item.metadata?.table_name && <div><span className="font-medium">Table :</span> <code className="text-xs bg-muted px-1 rounded">{item.metadata.table_name}</code></div>}
                        {item.metadata?.event_name && <div><span className="font-medium">Événement :</span> {item.metadata.event_name}</div>}
                        {item.metadata?.coupling != null && <div><span className="font-medium">Couplage :</span> {Math.round(item.metadata.coupling * 100)}%</div>}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* KPI impact items */}
      {kpiItems.length > 0 && (
        <Card className="border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-500" />
              KPIs à Risque ({kpiItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2">
                {kpiItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Target className="w-4 h-4 text-amber-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.item_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.impact_reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {getSeverityBadge(item.impact_score)}
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onUpdateStatus(item.id, 'reviewed')}>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onUpdateStatus(item.id, 'ignored')}>
                          <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {dataItems.length === 0 && kpiItems.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Database className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium">Aucun impact data/KPI détecté</p>
            <p className="text-sm text-muted-foreground mt-1">
              Liez des tables et KPIs pour détecter les risques Schema/Analytics/KPI Drift
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add data mapping dialog */}
      <Dialog open={showDataDialog} onOpenChange={setShowDataDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lier une table de données</DialogTitle>
            <DialogDescription>Associez une table, un événement ou un KPI à cet artefact</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom de la table</Label>
              <Input
                value={dataForm.tableName}
                onChange={e => setDataForm(f => ({ ...f, tableName: e.target.value }))}
                placeholder="public.orders"
                className="font-mono text-sm"
              />
            </div>
            <div>
              <Label>Événement (optionnel)</Label>
              <Input
                value={dataForm.eventName}
                onChange={e => setDataForm(f => ({ ...f, eventName: e.target.value }))}
                placeholder="order_created"
              />
            </div>
            <div>
              <Label>KPI lié (optionnel)</Label>
              <Input
                value={dataForm.kpiName}
                onChange={e => setDataForm(f => ({ ...f, kpiName: e.target.value }))}
                placeholder="Taux de conversion"
              />
            </div>
            <div>
              <Label>Confiance ({Math.round(parseFloat(dataForm.confidence || '0') * 100)}%)</Label>
              <Input
                type="range" min="0.1" max="1" step="0.1"
                value={dataForm.confidence}
                onChange={e => setDataForm(f => ({ ...f, confidence: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDataDialog(false)}>Annuler</Button>
            <Button onClick={addDataMapping} disabled={!dataForm.tableName}>
              <Database className="w-4 h-4 mr-2" />
              Lier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
