import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ImpactRun, ImpactItem, ArtefactLink, FeatureCodeMap, TestIndexEntry, FeatureDataMap } from './types';
import { ExecutiveView, TechnicalView, DataView, ActionLayer } from './views';
import { ImpactFeed } from './ImpactFeed';
import { ImpactDiffView } from './ImpactDiffView';
import { LinkSuggestions } from './LinkSuggestions';
import {
  AlertTriangle, FileText, Link2, Play, Loader2, BarChart3, Target,
  Plus, Trash2, ArrowRight, XCircle, Code2, TestTube2, FileCode,
  Database, Briefcase, Wrench, Activity, GitCompare, Sparkles, Upload,
} from 'lucide-react';

type ViewMode = 'executive' | 'technical' | 'data' | 'actions' | 'code-tests' | 'feed' | 'diff' | 'suggestions';

export const ImpactAnalysis: React.FC = () => {
  const { user } = useAuth();
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<string>('');
  const [impactRuns, setImpactRuns] = useState<ImpactRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<ImpactRun | null>(null);
  const [impactItems, setImpactItems] = useState<ImpactItem[]>([]);
  const [links, setLinks] = useState<ArtefactLink[]>([]);
  const [codeMaps, setCodeMaps] = useState<FeatureCodeMap[]>([]);
  const [testEntries, setTestEntries] = useState<TestIndexEntry[]>([]);
  const [dataMaps, setDataMaps] = useState<FeatureDataMap[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [linkForm, setLinkForm] = useState({ targetId: '', targetType: 'artefact', linkType: 'depends_on' });
  const [codeForm, setCodeForm] = useState({ filePath: '', confidence: '0.8' });
  const [testForm, setTestForm] = useState({ testFile: '', testName: '', testType: 'unit', relatedFilePath: '' });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('executive');
  const [isUploadAnalyzing, setIsUploadAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.id) loadArtifacts();
  }, [user?.id]);

  // Auto-trigger: listen for pending impact_queue items and call auto-impact-check
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('impact-auto-trigger')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'impact_queue',
        filter: `user_id=eq.${user.id}`,
      }, async (payload) => {
        const record = payload.new as any;
        if (record?.status === 'pending' && record?.scheduled_at) {
          const scheduledAt = new Date(record.scheduled_at).getTime();
          const now = Date.now();
          const delay = Math.max(0, scheduledAt - now);
          setTimeout(async () => {
            try {
              await supabase.functions.invoke('auto-impact-check');
            } catch (e) {
              console.error('auto-impact-check trigger failed:', e);
            }
          }, delay);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  useEffect(() => {
    if (selectedArtifact) {
      loadImpactRuns();
      loadLinks();
      loadCodeMaps();
      loadTestEntries();
      loadDataMaps();
    }
  }, [selectedArtifact]);

  useEffect(() => {
    if (selectedRun) loadImpactItems();
  }, [selectedRun?.id]);

  const loadArtifacts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('artifacts')
      .select('id, title, artifact_type, updated_at')
      .eq('user_id', user!.id)
      .order('updated_at', { ascending: false });
    setArtifacts(data || []);
    setLoading(false);
  };

  const loadImpactRuns = async () => {
    const { data } = await supabase
      .from('impact_runs').select('*')
      .eq('artefact_id', selectedArtifact)
      .order('created_at', { ascending: false }).limit(10);
    const runs = (data || []) as unknown as ImpactRun[];
    setImpactRuns(runs);
    if (runs.length > 0) setSelectedRun(runs[0]);
  };

  const loadImpactItems = async () => {
    if (!selectedRun) return;
    const { data } = await supabase
      .from('impact_items').select('*')
      .eq('impact_run_id', selectedRun.id)
      .order('impact_score', { ascending: false });
    setImpactItems((data || []) as unknown as ImpactItem[]);
  };

  const loadLinks = async () => {
    const { data } = await supabase.from('artefact_links').select('*').eq('source_id', selectedArtifact);
    setLinks((data || []) as unknown as ArtefactLink[]);
  };

  const loadCodeMaps = async () => {
    const { data } = await supabase.from('feature_code_map' as any).select('*')
      .eq('feature_id', selectedArtifact).order('created_at', { ascending: false });
    setCodeMaps((data || []) as unknown as FeatureCodeMap[]);
  };

  const loadTestEntries = async () => {
    const { data } = await supabase.from('test_index' as any).select('*')
      .eq('related_feature_id', selectedArtifact).order('created_at', { ascending: false });
    setTestEntries((data || []) as unknown as TestIndexEntry[]);
  };

  const loadDataMaps = async () => {
    const { data } = await supabase.from('feature_data_map' as any).select('*')
      .eq('feature_id', selectedArtifact).order('created_at', { ascending: false });
    setDataMaps((data || []) as unknown as FeatureDataMap[]);
  };

  const runImpactAnalysis = async () => {
    if (!selectedArtifact || !user?.id) return;
    setIsAnalyzing(true);
    const steps = [
      'Récupération du contenu actuel…',
      'Comparaison avec la version précédente…',
      'Classification des changements par IA…',
      'Recherche des fichiers code liés…',
      'Recherche des tests liés…',
      'Recherche des données et KPIs liés…',
      'Propagation des impacts…',
      'Génération du rapport…',
    ];
    for (const step of steps) {
      setAnalyzeStep(step);
      await new Promise(r => setTimeout(r, 500));
    }
    try {
      const { data: fullArtifact } = await supabase
        .from('artifacts').select('*').eq('id', selectedArtifact).single();
      if (!fullArtifact) throw new Error('Artefact introuvable');

      const { data: funcData, error } = await supabase.functions.invoke('analyze-impact', {
        body: { artefactId: selectedArtifact, newContent: fullArtifact.content, userId: user.id },
      });
      if (error) throw error;

      toast.success(
        `Analyse terminée : ${funcData.changes?.length || 0} changements, ` +
        `${funcData.codeImpacts || 0} code, ${funcData.testImpacts || 0} tests, ` +
        `${funcData.dataImpacts || 0} data, ${funcData.kpiImpacts || 0} KPIs`
      );
      await loadImpactRuns();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erreur lors de l'analyse");
    } finally {
      setIsAnalyzing(false);
      setAnalyzeStep('');
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedArtifact || !user?.id) return;

    const allowedTypes = ['text/plain', 'text/markdown', 'text/csv', 'application/json', 'text/html'];
    const allowedExtensions = ['.txt', '.md', '.csv', '.json', '.html', '.xml', '.yaml', '.yml'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      toast.error('Format non supporté. Utilisez : TXT, MD, CSV, JSON, HTML, XML, YAML');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 5 Mo)');
      return;
    }

    setIsUploadAnalyzing(true);
    setAnalyzeStep(`Lecture du document "${file.name}"…`);

    try {
      const text = await file.text();
      if (!text.trim()) {
        toast.error('Le document est vide');
        return;
      }

      setAnalyzeStep('Analyse des impacts par IA…');

      const { data: funcData, error } = await supabase.functions.invoke('analyze-document-impact', {
        body: {
          documentText: text.slice(0, 100000),
          documentName: file.name,
          artefactId: selectedArtifact,
          userId: user.id,
        },
      });

      if (error) throw error;
      if (funcData?.error) throw new Error(funcData.error);

      if (funcData?.changes?.length === 0) {
        toast.info('Aucun impact détecté entre le document et l\'artefact sélectionné.');
      } else {
        toast.success(funcData.message || `${funcData.impactItemsCount} impact(s) détecté(s)`);
        await loadImpactRuns();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erreur lors de l'analyse du document");
    } finally {
      setIsUploadAnalyzing(false);
      setAnalyzeStep('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const updateItemStatus = async (itemId: string, status: string) => {
    await supabase.from('impact_items').update({ review_status: status }).eq('id', itemId);
    setImpactItems(prev => prev.map(i => i.id === itemId ? { ...i, review_status: status as ImpactItem['review_status'] } : i));
    toast.success('Statut mis à jour');
  };

  // Link management
  const addLink = async () => {
    if (!user?.id || !selectedArtifact) return;
    await supabase.from('artefact_links').insert({
      source_id: selectedArtifact, target_type: linkForm.targetType,
      target_id: linkForm.targetId, link_type: linkForm.linkType,
      user_id: user.id, confidence_score: 1.0,
    });
    toast.success('Lien ajouté');
    setShowLinkDialog(false);
    setLinkForm({ targetId: '', targetType: 'artefact', linkType: 'depends_on' });
    loadLinks();
  };

  const removeLink = async (id: string) => {
    await supabase.from('artefact_links').delete().eq('id', id);
    toast.success('Lien supprimé');
    loadLinks();
  };

  // Code mapping
  const addCodeMapping = async () => {
    if (!user?.id || !selectedArtifact || !codeForm.filePath) return;
    await supabase.from('feature_code_map' as any).insert({
      feature_id: selectedArtifact, file_path: codeForm.filePath,
      confidence: parseFloat(codeForm.confidence) || 0.8,
      link_source: 'manual', user_id: user.id,
    } as any);
    toast.success('Fichier code lié');
    setShowCodeDialog(false);
    setCodeForm({ filePath: '', confidence: '0.8' });
    loadCodeMaps();
  };

  const removeCodeMap = async (id: string) => {
    await supabase.from('feature_code_map' as any).delete().eq('id', id);
    toast.success('Lien code supprimé');
    loadCodeMaps();
  };

  // Test management
  const addTestEntry = async () => {
    if (!user?.id || !selectedArtifact || !testForm.testFile) return;
    await supabase.from('test_index' as any).insert({
      related_feature_id: selectedArtifact, test_file: testForm.testFile,
      test_name: testForm.testName || null, test_type: testForm.testType,
      related_file_path: testForm.relatedFilePath || null, user_id: user.id,
    } as any);
    toast.success('Test lié');
    setShowTestDialog(false);
    setTestForm({ testFile: '', testName: '', testType: 'unit', relatedFilePath: '' });
    loadTestEntries();
  };

  const removeTestEntry = async (id: string) => {
    await supabase.from('test_index' as any).delete().eq('id', id);
    toast.success('Test supprimé');
    loadTestEntries();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const viewButtons: { key: ViewMode; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'feed', label: 'Fil', icon: <Activity className="w-4 h-4" /> },
    { key: 'executive', label: 'Exécutif', icon: <Briefcase className="w-4 h-4" /> },
    { key: 'technical', label: 'Technique', icon: <Code2 className="w-4 h-4" /> },
    { key: 'data', label: 'Données', icon: <Database className="w-4 h-4" /> },
    { key: 'actions', label: 'Actions', icon: <Activity className="w-4 h-4" /> },
    { key: 'diff', label: 'Diff', icon: <GitCompare className="w-4 h-4" /> },
    { key: 'suggestions', label: 'Auto-liens', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'code-tests', label: 'Liens', icon: <Wrench className="w-4 h-4" />, count: codeMaps.length + testEntries.length + dataMaps.length },
  ];

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Analyse d'Impact</h2>
        <p className="text-muted-foreground mt-1">
          Détectez automatiquement les conséquences d'une modification sur votre produit
        </p>
      </div>

      {/* Artifact selection + actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label className="text-sm font-medium mb-2 block">Artefact à analyser</Label>
          <Select value={selectedArtifact} onValueChange={setSelectedArtifact}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un artefact…" />
            </SelectTrigger>
            <SelectContent>
              {artifacts.map(a => (
                <SelectItem key={a.id} value={a.id}>
                  <span className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{a.artifact_type}</Badge>
                    {a.title}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 items-end flex-wrap">
          <Button onClick={runImpactAnalysis} disabled={!selectedArtifact || isAnalyzing || isUploadAnalyzing}>
            {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Lancer l'analyse
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={!selectedArtifact || isAnalyzing || isUploadAnalyzing}
          >
            {isUploadAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Uploader un document
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".txt,.md,.csv,.json,.html,.xml,.yaml,.yml"
            onChange={handleDocumentUpload}
          />
          <Button variant="outline" onClick={() => setShowLinkDialog(true)} disabled={!selectedArtifact}>
            <Link2 className="w-4 h-4 mr-2" />
            Liens
          </Button>
        </div>
      </div>

      {/* Cognitive loader */}
      {(isAnalyzing || isUploadAnalyzing) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div>
                <p className="font-medium text-primary">
                  {isUploadAnalyzing ? 'Nova analyse le document…' : 'Nova analyse les impacts…'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{analyzeStep}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View switcher */}
      {selectedArtifact && (
        <div className="flex gap-2 flex-wrap">
          {viewButtons.map(v => (
            <Button
              key={v.key}
              variant={viewMode === v.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode(v.key)}
            >
              {v.icon}
              <span className="ml-2">{v.label}</span>
              {v.count != null && <Badge variant="secondary" className="ml-1.5 text-xs">{v.count}</Badge>}
            </Button>
          ))}
        </div>
      )}

      {/* Run history selector */}
      {selectedArtifact && selectedRun && impactRuns.length > 1 && viewMode !== 'code-tests' && (
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Historique :</Label>
          <Select value={selectedRun.id} onValueChange={id => setSelectedRun(impactRuns.find(r => r.id === id) || null)}>
            <SelectTrigger className="w-auto min-w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {impactRuns.map(run => (
                <SelectItem key={run.id} value={run.id}>
                  {new Date(run.created_at).toLocaleString('fr-FR')} — Score: {run.impact_score}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Links overview (shared) */}
      {selectedArtifact && links.length > 0 && viewMode !== 'code-tests' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Relations ({links.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {links.map(link => (
                <Badge key={link.id} variant="secondary" className="flex items-center gap-1.5 py-1 px-2">
                  {link.link_type}
                  <ArrowRight className="w-3 h-3" />
                  <span className="text-xs">{link.target_type}:{link.target_id.slice(0, 8)}</span>
                  <button onClick={() => removeLink(link.id)} className="ml-1 hover:text-destructive">
                    <XCircle className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Views */}
      {selectedArtifact && viewMode === 'feed' && (
        <ImpactFeed onNavigateToRun={(id) => { setSelectedArtifact(id); setViewMode('executive'); }} />
      )}

      {selectedArtifact && viewMode === 'diff' && (
        <ImpactDiffView runs={impactRuns} artefactId={selectedArtifact} />
      )}

      {selectedArtifact && viewMode === 'suggestions' && (
        <LinkSuggestions artefactId={selectedArtifact} onAccepted={() => { loadCodeMaps(); loadLinks(); loadDataMaps(); }} />
      )}

      {selectedArtifact && viewMode === 'executive' && selectedRun && (
        <ExecutiveView run={selectedRun} items={impactItems} />
      )}

      {selectedArtifact && viewMode === 'technical' && selectedRun && (
        <TechnicalView items={impactItems} onUpdateStatus={updateItemStatus} />
      )}

      {selectedArtifact && viewMode === 'data' && (
        <DataView
          items={impactItems}
          dataMaps={dataMaps}
          selectedArtifact={selectedArtifact}
          userId={user?.id || ''}
          onUpdateStatus={updateItemStatus}
          onDataMapsChange={loadDataMaps}
        />
      )}

      {selectedArtifact && viewMode === 'actions' && selectedRun && (
        <ActionLayer run={selectedRun} items={impactItems} />
      )}

      {/* Code & Tests management (Liens view) */}
      {selectedArtifact && viewMode === 'code-tests' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Files */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileCode className="w-4 h-4" />
                  Fichiers Code ({codeMaps.length})
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => setShowCodeDialog(true)}>
                  <Plus className="w-3 h-3 mr-1" />
                  Ajouter
                </Button>
              </div>
              <CardDescription>Fichiers source implémentant cette feature</CardDescription>
            </CardHeader>
            <CardContent>
              {codeMaps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileCode className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun fichier code lié</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-2">
                    {codeMaps.map(cm => (
                      <div key={cm.id} className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Code2 className="w-4 h-4 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-mono truncate">{cm.file_path}</p>
                            <span className="text-xs text-muted-foreground">
                              Confiance: {Math.round((cm.confidence || 0) * 100)}%
                            </span>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => removeCodeMap(cm.id)}>
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Tests */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TestTube2 className="w-4 h-4" />
                  Tests ({testEntries.length})
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => setShowTestDialog(true)}>
                  <Plus className="w-3 h-3 mr-1" />
                  Ajouter
                </Button>
              </div>
              <CardDescription>Tests validant cette feature</CardDescription>
            </CardHeader>
            <CardContent>
              {testEntries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TestTube2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun test lié</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-2">
                    {testEntries.map(te => (
                      <div key={te.id} className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <TestTube2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{te.test_name || te.test_file}</p>
                            <Badge variant="outline" className="text-xs">{te.test_type}</Badge>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => removeTestEntry(te.id)}>
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty states */}
      {selectedArtifact && !selectedRun && !isAnalyzing && viewMode !== 'code-tests' && viewMode !== 'data' && (
        <Card>
          <CardContent className="py-12 text-center">
            <Play className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium">Aucune analyse effectuée</p>
            <p className="text-sm text-muted-foreground mt-1">Cliquez sur "Lancer l'analyse" pour démarrer</p>
          </CardContent>
        </Card>
      )}

      {!selectedArtifact && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium">Sélectionnez un artefact</p>
            <p className="text-sm text-muted-foreground mt-1">Choisissez un document pour analyser ses impacts</p>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un lien</DialogTitle>
            <DialogDescription>Reliez cet artefact à d'autres éléments du produit</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type de cible</Label>
              <Select value={linkForm.targetType} onValueChange={v => setLinkForm(f => ({ ...f, targetType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="artefact">Artefact</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                  <SelectItem value="kpi">KPI</SelectItem>
                  <SelectItem value="data">Données</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Élément cible</Label>
              {linkForm.targetType === 'artefact' ? (
                <Select value={linkForm.targetId} onValueChange={v => setLinkForm(f => ({ ...f, targetId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
                  <SelectContent>
                    {artifacts.filter(a => a.id !== selectedArtifact).map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={linkForm.targetId}
                  onChange={e => setLinkForm(f => ({ ...f, targetId: e.target.value }))}
                  placeholder="Identifiant de l'élément"
                />
              )}
            </div>
            <div>
              <Label>Type de relation</Label>
              <Select value={linkForm.linkType} onValueChange={v => setLinkForm(f => ({ ...f, linkType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="defines">Définit</SelectItem>
                  <SelectItem value="implements">Implémente</SelectItem>
                  <SelectItem value="measured_by">Mesuré par</SelectItem>
                  <SelectItem value="depends_on">Dépend de</SelectItem>
                  <SelectItem value="feeds_into">Alimente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>Annuler</Button>
            <Button onClick={addLink} disabled={!linkForm.targetId}>
              <Plus className="w-4 h-4 mr-2" />Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lier un fichier code</DialogTitle>
            <DialogDescription>Associez un fichier source à cet artefact</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Chemin du fichier</Label>
              <Input value={codeForm.filePath} onChange={e => setCodeForm(f => ({ ...f, filePath: e.target.value }))} placeholder="src/services/order.ts" className="font-mono text-sm" />
            </div>
            <div>
              <Label>Confiance ({Math.round(parseFloat(codeForm.confidence || '0') * 100)}%)</Label>
              <Input type="range" min="0.1" max="1" step="0.1" value={codeForm.confidence} onChange={e => setCodeForm(f => ({ ...f, confidence: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCodeDialog(false)}>Annuler</Button>
            <Button onClick={addCodeMapping} disabled={!codeForm.filePath}>
              <Code2 className="w-4 h-4 mr-2" />Lier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lier un test</DialogTitle>
            <DialogDescription>Associez un test à cet artefact</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Fichier de test</Label>
              <Input value={testForm.testFile} onChange={e => setTestForm(f => ({ ...f, testFile: e.target.value }))} placeholder="tests/order.test.ts" className="font-mono text-sm" />
            </div>
            <div>
              <Label>Nom du test (optionnel)</Label>
              <Input value={testForm.testName} onChange={e => setTestForm(f => ({ ...f, testName: e.target.value }))} placeholder="should cancel order within 24h" />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={testForm.testType} onValueChange={v => setTestForm(f => ({ ...f, testType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unit">Unitaire</SelectItem>
                  <SelectItem value="integration">Intégration</SelectItem>
                  <SelectItem value="e2e">End-to-End</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fichier source lié (optionnel)</Label>
              <Input value={testForm.relatedFilePath} onChange={e => setTestForm(f => ({ ...f, relatedFilePath: e.target.value }))} placeholder="src/services/order.ts" className="font-mono text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestDialog(false)}>Annuler</Button>
            <Button onClick={addTestEntry} disabled={!testForm.testFile}>
              <TestTube2 className="w-4 h-4 mr-2" />Lier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
