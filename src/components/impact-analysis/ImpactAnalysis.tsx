import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ImpactRun, ImpactItem, ArtefactLink, FeatureCodeMap, TestIndexEntry } from './types';
import {
  AlertTriangle, FileText, Link2, Play, ChevronDown, ChevronRight,
  Eye, CheckCircle2, XCircle, Loader2, BarChart3, Target,
  Plus, Trash2, ArrowRight, Zap, Shield, Database, ClipboardList,
  Code2, TestTube2, GitBranch, FileCode,
} from 'lucide-react';

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [linkForm, setLinkForm] = useState({ targetId: '', targetType: 'artefact', linkType: 'depends_on' });
  const [codeForm, setCodeForm] = useState({ filePath: '', confidence: '0.8' });
  const [testForm, setTestForm] = useState({ testFile: '', testName: '', testType: 'unit', relatedFilePath: '' });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'report' | 'code-tests'>('report');

  useEffect(() => {
    if (user?.id) loadArtifacts();
  }, [user?.id]);

  useEffect(() => {
    if (selectedArtifact) {
      loadImpactRuns();
      loadLinks();
      loadCodeMaps();
      loadTestEntries();
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
      .from('impact_runs')
      .select('*')
      .eq('artefact_id', selectedArtifact)
      .order('created_at', { ascending: false })
      .limit(10);
    const runs = (data || []) as unknown as ImpactRun[];
    setImpactRuns(runs);
    if (runs.length > 0) setSelectedRun(runs[0]);
  };

  const loadImpactItems = async () => {
    if (!selectedRun) return;
    const { data } = await supabase
      .from('impact_items')
      .select('*')
      .eq('impact_run_id', selectedRun.id)
      .order('impact_score', { ascending: false });
    setImpactItems((data || []) as unknown as ImpactItem[]);
  };

  const loadLinks = async () => {
    const { data } = await supabase
      .from('artefact_links')
      .select('*')
      .eq('source_id', selectedArtifact);
    setLinks((data || []) as unknown as ArtefactLink[]);
  };

  const loadCodeMaps = async () => {
    const { data } = await supabase
      .from('feature_code_map' as any)
      .select('*')
      .eq('feature_id', selectedArtifact)
      .order('created_at', { ascending: false });
    setCodeMaps((data || []) as unknown as FeatureCodeMap[]);
  };

  const loadTestEntries = async () => {
    const { data } = await supabase
      .from('test_index' as any)
      .select('*')
      .eq('related_feature_id', selectedArtifact)
      .order('created_at', { ascending: false });
    setTestEntries((data || []) as unknown as TestIndexEntry[]);
  };

  const runImpactAnalysis = async () => {
    if (!selectedArtifact || !user?.id) return;

    const artifact = artifacts.find(a => a.id === selectedArtifact);
    if (!artifact) return;

    setIsAnalyzing(true);
    const steps = [
      'Récupération du contenu actuel…',
      'Comparaison avec la version précédente…',
      'Classification des changements par IA…',
      'Recherche des fichiers code liés…',
      'Recherche des tests liés…',
      'Propagation des impacts…',
      'Génération du rapport…',
    ];

    for (const step of steps) {
      setAnalyzeStep(step);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      const { data: fullArtifact } = await supabase
        .from('artifacts')
        .select('*')
        .eq('id', selectedArtifact)
        .single();

      if (!fullArtifact) throw new Error('Artefact introuvable');

      const { data: funcData, error } = await supabase.functions.invoke('analyze-impact', {
        body: {
          artefactId: selectedArtifact,
          newContent: fullArtifact.content,
          userId: user.id,
        },
      });

      if (error) throw error;

      toast.success(
        `Analyse terminée : ${funcData.changes?.length || 0} changements, ` +
        `${funcData.codeImpacts || 0} fichiers code, ${funcData.testImpacts || 0} tests impactés`
      );
      await loadImpactRuns();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erreur lors de l\'analyse');
    } finally {
      setIsAnalyzing(false);
      setAnalyzeStep('');
    }
  };

  const addLink = async () => {
    if (!user?.id || !selectedArtifact) return;
    try {
      await supabase.from('artefact_links').insert({
        source_id: selectedArtifact,
        target_type: linkForm.targetType,
        target_id: linkForm.targetId,
        link_type: linkForm.linkType,
        user_id: user.id,
        confidence_score: 1.0,
      });
      toast.success('Lien ajouté');
      setShowLinkDialog(false);
      setLinkForm({ targetId: '', targetType: 'artefact', linkType: 'depends_on' });
      loadLinks();
    } catch (err: any) {
      toast.error('Erreur lors de l\'ajout du lien');
    }
  };

  const addCodeMapping = async () => {
    if (!user?.id || !selectedArtifact || !codeForm.filePath) return;
    try {
      await supabase.from('feature_code_map' as any).insert({
        feature_id: selectedArtifact,
        file_path: codeForm.filePath,
        confidence: parseFloat(codeForm.confidence) || 0.8,
        link_source: 'manual',
        user_id: user.id,
      } as any);
      toast.success('Fichier code lié');
      setShowCodeDialog(false);
      setCodeForm({ filePath: '', confidence: '0.8' });
      loadCodeMaps();
    } catch (err: any) {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const addTestEntry = async () => {
    if (!user?.id || !selectedArtifact || !testForm.testFile) return;
    try {
      await supabase.from('test_index' as any).insert({
        related_feature_id: selectedArtifact,
        test_file: testForm.testFile,
        test_name: testForm.testName || null,
        test_type: testForm.testType,
        related_file_path: testForm.relatedFilePath || null,
        user_id: user.id,
      } as any);
      toast.success('Test lié');
      setShowTestDialog(false);
      setTestForm({ testFile: '', testName: '', testType: 'unit', relatedFilePath: '' });
      loadTestEntries();
    } catch (err: any) {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const removeLink = async (linkId: string) => {
    await supabase.from('artefact_links').delete().eq('id', linkId);
    toast.success('Lien supprimé');
    loadLinks();
  };

  const removeCodeMap = async (id: string) => {
    await supabase.from('feature_code_map' as any).delete().eq('id', id);
    toast.success('Lien code supprimé');
    loadCodeMaps();
  };

  const removeTestEntry = async (id: string) => {
    await supabase.from('test_index' as any).delete().eq('id', id);
    toast.success('Test supprimé');
    loadTestEntries();
  };

  const updateItemStatus = async (itemId: string, status: string) => {
    await supabase.from('impact_items').update({ review_status: status }).eq('id', itemId);
    setImpactItems(prev => prev.map(i => i.id === itemId ? { ...i, review_status: status as ImpactItem['review_status'] } : i));
    toast.success('Statut mis à jour');
  };

  const getSeverityColor = (score: number) => {
    if (score >= 4) return 'text-destructive';
    if (score >= 2) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getSeverityBadge = (score: number) => {
    if (score >= 4) return <Badge variant="destructive">Critique</Badge>;
    if (score >= 2) return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Modéré</Badge>;
    return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Faible</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'documentation': return <FileText className="w-4 h-4" />;
      case 'backlog': return <ClipboardList className="w-4 h-4" />;
      case 'spec': return <Shield className="w-4 h-4" />;
      case 'code': return <Code2 className="w-4 h-4" />;
      case 'test': return <TestTube2 className="w-4 h-4" />;
      case 'data': return <Database className="w-4 h-4" />;
      case 'kpi': return <Target className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const groupedItems = impactItems.reduce<Record<string, ImpactItem[]>>((acc, item) => {
    acc[item.item_type] = acc[item.item_type] || [];
    acc[item.item_type].push(item);
    return acc;
  }, {});

  const typeLabels: Record<string, string> = {
    documentation: 'Documentation',
    backlog: 'Backlog',
    spec: 'Spécifications',
    test: 'Tests',
    code: 'Code',
    kpi: 'KPIs',
    data: 'Données',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

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

        <div className="flex gap-2 items-end">
          <Button
            onClick={runImpactAnalysis}
            disabled={!selectedArtifact || isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Lancer l'analyse
          </Button>
          <Button variant="outline" onClick={() => setShowLinkDialog(true)} disabled={!selectedArtifact}>
            <Link2 className="w-4 h-4 mr-2" />
            Liens
          </Button>
        </div>
      </div>

      {/* Cognitive loader */}
      {isAnalyzing && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div>
                <p className="font-medium text-primary">Nova analyse les impacts…</p>
                <p className="text-sm text-muted-foreground mt-1">{analyzeStep}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section switcher */}
      {selectedArtifact && (
        <div className="flex gap-2">
          <Button
            variant={activeSection === 'report' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSection('report')}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Rapport d'impact
          </Button>
          <Button
            variant={activeSection === 'code-tests' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSection('code-tests')}
          >
            <Code2 className="w-4 h-4 mr-2" />
            Code & Tests ({codeMaps.length + testEntries.length})
          </Button>
        </div>
      )}

      {/* Code & Tests Management Section */}
      {selectedArtifact && activeSection === 'code-tests' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Files */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileCode className="w-4 h-4" />
                  Fichiers Code Liés ({codeMaps.length})
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
                  <p className="text-xs mt-1">Ajoutez des fichiers pour tracer l'impact sur le code</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-2">
                    {codeMaps.map(cm => (
                      <div key={cm.id} className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Code2 className="w-4 h-4 text-blue-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-mono truncate">{cm.file_path}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-xs">{cm.link_source}</Badge>
                              <span className="text-xs text-muted-foreground">
                                Confiance: {Math.round((cm.confidence || 0) * 100)}%
                              </span>
                            </div>
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
                  Tests Liés ({testEntries.length})
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
                  <p className="text-xs mt-1">Ajoutez des tests pour tracer les revalidations nécessaires</p>
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
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-xs">{te.test_type}</Badge>
                              {te.related_file_path && (
                                <span className="text-xs text-muted-foreground font-mono truncate">
                                  {te.related_file_path}
                                </span>
                              )}
                            </div>
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

      {/* Impact Report Section */}
      {selectedArtifact && activeSection === 'report' && (
        <>
          {/* Links overview */}
          {links.length > 0 && (
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

          {selectedRun && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${selectedRun.impact_score >= 10 ? 'bg-destructive/10' : selectedRun.impact_score >= 5 ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
                        <AlertTriangle className={`w-5 h-5 ${getSeverityColor(selectedRun.impact_score / 3)}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{selectedRun.impact_score}</p>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{selectedRun.summary?.total_changes || 0}</p>
                        <p className="text-xs text-muted-foreground">Changements</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-destructive/10">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{selectedRun.summary?.high_severity_count || 0}</p>
                        <p className="text-xs text-muted-foreground">Sévérité haute</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <BarChart3 className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{impactItems.length}</p>
                        <p className="text-xs text-muted-foreground">Impactés</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Code2 className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{selectedRun.summary?.code_files_impacted || 0}</p>
                        <p className="text-xs text-muted-foreground">Code</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <TestTube2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{selectedRun.summary?.tests_impacted || 0}</p>
                        <p className="text-xs text-muted-foreground">Tests</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Run history selector */}
              {impactRuns.length > 1 && (
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

              {/* Impact items by type */}
              <Tabs defaultValue={Object.keys(groupedItems)[0] || 'documentation'}>
                <TabsList className="flex-wrap h-auto">
                  {Object.entries(groupedItems).map(([type, items]) => (
                    <TabsTrigger key={type} value={type} className="gap-2">
                      {getTypeIcon(type)}
                      {typeLabels[type] || type}
                      <Badge variant="secondary" className="ml-1 text-xs">{items.length}</Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(groupedItems).map(([type, items]) => (
                  <TabsContent key={type} value={type}>
                    <Card>
                      <CardContent className="pt-6">
                        <ScrollArea className="max-h-[500px]">
                          <div className="space-y-3">
                            {items.map(item => (
                              <Collapsible key={item.id}>
                                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {getTypeIcon(item.item_type)}
                                    <div className="flex-1 min-w-0">
                                      <p className={`font-medium text-sm truncate ${item.item_type === 'code' ? 'font-mono' : ''}`}>
                                        {item.item_name}
                                      </p>
                                      <p className="text-xs text-muted-foreground truncate">{item.impact_reason}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 ml-2">
                                    {getSeverityBadge(item.impact_score)}
                                    <Badge variant={
                                      item.review_status === 'reviewed' ? 'default' :
                                      item.review_status === 'review_required' ? 'destructive' :
                                      item.review_status === 'ignored' ? 'secondary' : 'outline'
                                    } className="text-xs">
                                      {item.review_status === 'review_required' ? 'À revoir' :
                                       item.review_status === 'reviewed' ? 'Revu' :
                                       item.review_status === 'ignored' ? 'Ignoré' : 'En attente'}
                                    </Badge>
                                    <div className="flex gap-1">
                                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateItemStatus(item.id, 'reviewed')}>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                      </Button>
                                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateItemStatus(item.id, 'ignored')}>
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
                                  <div className="mt-2 p-3 bg-muted/30 rounded-lg text-sm space-y-2">
                                    <div><span className="font-medium">Raison :</span> {item.impact_reason}</div>
                                    {item.metadata?.change_type && (
                                      <div><span className="font-medium">Type de changement :</span> {item.metadata.change_type}</div>
                                    )}
                                    {item.metadata?.entity && (
                                      <div><span className="font-medium">Entité :</span> {item.metadata.entity}</div>
                                    )}
                                    {item.metadata?.file_path && (
                                      <div><span className="font-medium">Fichier :</span> <code className="text-xs bg-muted px-1 py-0.5 rounded">{item.metadata.file_path}</code></div>
                                    )}
                                    {item.metadata?.coupling != null && (
                                      <div><span className="font-medium">Couplage :</span> {Math.round(item.metadata.coupling * 100)}%</div>
                                    )}
                                    {item.metadata?.test_file && (
                                      <div><span className="font-medium">Fichier test :</span> <code className="text-xs bg-muted px-1 py-0.5 rounded">{item.metadata.test_file}</code></div>
                                    )}
                                    {item.metadata?.test_type && (
                                      <div><span className="font-medium">Type de test :</span> {item.metadata.test_type}</div>
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>

              {/* Empty state */}
              {impactItems.length === 0 && !isAnalyzing && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Target className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="font-medium">Aucun impact détecté</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Lancez une analyse ou ajoutez des liens code/tests pour enrichir la détection
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* No run yet */}
          {!selectedRun && !isAnalyzing && (
            <Card>
              <CardContent className="py-12 text-center">
                <Play className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="font-medium">Aucune analyse effectuée</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Cliquez sur "Lancer l'analyse" pour démarrer
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* No artifact selected */}
      {!selectedArtifact && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium">Sélectionnez un artefact</p>
            <p className="text-sm text-muted-foreground mt-1">
              Choisissez un document (PRD, Spec, ADR…) pour analyser ses impacts
            </p>
          </CardContent>
        </Card>
      )}

      {/* Link management dialog */}
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
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>Annuler</Button>
            <Button onClick={addLink} disabled={!linkForm.targetId}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Code mapping dialog */}
      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lier un fichier code</DialogTitle>
            <DialogDescription>Associez un fichier source à cet artefact pour tracer les impacts</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Chemin du fichier</Label>
              <Input
                value={codeForm.filePath}
                onChange={e => setCodeForm(f => ({ ...f, filePath: e.target.value }))}
                placeholder="src/services/order.ts"
                className="font-mono text-sm"
              />
            </div>
            <div>
              <Label>Niveau de confiance ({Math.round(parseFloat(codeForm.confidence || '0') * 100)}%)</Label>
              <Input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={codeForm.confidence}
                onChange={e => setCodeForm(f => ({ ...f, confidence: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Confiance élevée = impact score plus fort lors de l'analyse
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCodeDialog(false)}>Annuler</Button>
            <Button onClick={addCodeMapping} disabled={!codeForm.filePath}>
              <Code2 className="w-4 h-4 mr-2" />
              Lier le fichier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test entry dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lier un test</DialogTitle>
            <DialogDescription>Associez un test à cet artefact pour tracer les revalidations</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Fichier de test</Label>
              <Input
                value={testForm.testFile}
                onChange={e => setTestForm(f => ({ ...f, testFile: e.target.value }))}
                placeholder="tests/order.test.ts"
                className="font-mono text-sm"
              />
            </div>
            <div>
              <Label>Nom du test (optionnel)</Label>
              <Input
                value={testForm.testName}
                onChange={e => setTestForm(f => ({ ...f, testName: e.target.value }))}
                placeholder="should cancel order within 24h"
              />
            </div>
            <div>
              <Label>Type de test</Label>
              <Select value={testForm.testType} onValueChange={v => setTestForm(f => ({ ...f, testType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unit">Unitaire</SelectItem>
                  <SelectItem value="integration">Intégration</SelectItem>
                  <SelectItem value="e2e">End-to-End</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="security">Sécurité</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fichier source lié (optionnel)</Label>
              <Input
                value={testForm.relatedFilePath}
                onChange={e => setTestForm(f => ({ ...f, relatedFilePath: e.target.value }))}
                placeholder="src/services/order.ts"
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestDialog(false)}>Annuler</Button>
            <Button onClick={addTestEntry} disabled={!testForm.testFile}>
              <TestTube2 className="w-4 h-4 mr-2" />
              Lier le test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
