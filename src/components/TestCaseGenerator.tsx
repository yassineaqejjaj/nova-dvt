import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, 
  Save, 
  Sparkles, 
  CheckCircle2, 
  Code,
  FileText,
  TrendingUp,
  AlertTriangle,
  Import
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ContextSelector } from '@/components/ContextSelector';

interface TestCase {
  id: string;
  title: string;
  level: 'unit' | 'integration' | 'e2e' | 'api';
  priority: 'high' | 'medium' | 'low';
  description: string;
  preconditions: string[];
  steps: string[];
  expectedResults: string;
  testData: string;
  automatable: boolean;
  estimatedEffort: string;
}

interface CoverageAnalysis {
  totalCases: number;
  byLevel: {
    unit: number;
    integration: number;
    e2e: number;
    api: number;
  };
  coverageScore: number;
  missingScenarios: string[];
}

interface SavedArtifact {
  id: string;
  title: string;
  artifact_type: string;
  content: any;
  created_at: string;
}

export const TestCaseGenerator = () => {
  const [artifactContent, setArtifactContent] = useState('');
  const [artifactType, setArtifactType] = useState<'user-story' | 'tech-spec' | 'epic'>('user-story');
  const [context, setContext] = useState('');
  const [testLevels, setTestLevels] = useState<string[]>(['unit', 'integration', 'e2e']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [coverageAnalysis, setCoverageAnalysis] = useState<CoverageAnalysis | null>(null);
  const [automationScript, setAutomationScript] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedArtifacts, setSavedArtifacts] = useState<SavedArtifact[]>([]);
  const [selectedArtifacts, setSelectedArtifacts] = useState<string[]>([]);
  const [isLoadingArtifacts, setIsLoadingArtifacts] = useState(false);
  const [showArtifactSelector, setShowArtifactSelector] = useState(false);

  useEffect(() => {
    loadSavedArtifacts();
  }, []);

  const loadSavedArtifacts = async () => {
    setIsLoadingArtifacts(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('artifacts')
        .select('id, title, artifact_type, content, created_at')
        .eq('user_id', user.id)
        .in('artifact_type', ['story', 'epic'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedArtifacts(data || []);
    } catch (error: any) {
      console.error('Error loading artifacts:', error);
      toast.error('Erreur lors du chargement des artefacts');
    } finally {
      setIsLoadingArtifacts(false);
    }
  };

  const handleArtifactToggle = (artifactId: string) => {
    setSelectedArtifacts(prev =>
      prev.includes(artifactId)
        ? prev.filter(id => id !== artifactId)
        : [...prev, artifactId]
    );
  };

  const handleImportArtifacts = () => {
    if (selectedArtifacts.length === 0) {
      toast.error('Sélectionnez au moins un artefact');
      return;
    }

    const selected = savedArtifacts.filter(a => selectedArtifacts.includes(a.id));
    const combinedContent = selected.map(artifact => {
      const content = typeof artifact.content === 'string' 
        ? artifact.content 
        : JSON.stringify(artifact.content, null, 2);
      return `=== ${artifact.title} ===\n${content}`;
    }).join('\n\n');

    setArtifactContent(combinedContent);
    setShowArtifactSelector(false);
    toast.success(`${selectedArtifacts.length} artefact(s) importé(s)`);
  };

  const handleTestLevelToggle = (level: string) => {
    setTestLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const generateTestCases = async () => {
    if (!artifactContent.trim()) {
      toast.error('Veuillez fournir le contenu de l\'artefact');
      return;
    }

    if (testLevels.length === 0) {
      toast.error('Sélectionnez au moins un niveau de test');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-test-cases', {
        body: {
          artifactContent,
          artifactType,
          testLevels,
          context
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Erreur lors de l\'appel à la fonction');
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.testCases || data.testCases.length === 0) {
        throw new Error('Aucun cas de test généré. Veuillez réessayer.');
      }

      setTestCases(data.testCases || []);
      setCoverageAnalysis(data.coverageAnalysis || null);
      setAutomationScript(data.automationScript || '');
      
      toast.success(`${data.testCases?.length || 0} cas de test générés avec succès!`);
    } catch (error: any) {
      console.error('Error generating test cases:', error);
      
      let errorMessage = 'Erreur lors de la génération des cas de test';
      
      if (error.message?.includes('too large')) {
        errorMessage = 'Le contenu sélectionné est trop volumineux. Veuillez sélectionner moins d\'artefacts.';
      } else if (error.message?.includes('Rate limit')) {
        errorMessage = 'Limite de taux dépassée. Veuillez réessayer dans quelques instants.';
      } else if (error.message?.includes('usage limit')) {
        errorMessage = 'Limite d\'utilisation atteinte. Veuillez ajouter des crédits.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveAsArtifact = async () => {
    if (testCases.length === 0) {
      toast.error('Aucun cas de test à sauvegarder');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.from('artifacts').insert({
        user_id: user.id,
        artifact_type: 'canvas' as const,
        title: `Test Cases - ${artifactType} - ${new Date().toLocaleDateString('fr-FR')}`,
        content: { 
          testCases, 
          coverageAnalysis, 
          automationScript,
          artifactType,
          generatedAt: new Date().toISOString()
        },
        metadata: { type: 'test-cases' }
      } as any);

      if (error) throw error;
      toast.success('Cas de test sauvegardés dans les artefacts!');
    } catch (error) {
      console.error('Error saving artifact:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority as keyof typeof colors];
  };

  const getLevelColor = (level: string) => {
    const colors = {
      unit: 'bg-blue-100 text-blue-800',
      integration: 'bg-purple-100 text-purple-800',
      e2e: 'bg-orange-100 text-orange-800',
      api: 'bg-teal-100 text-teal-800'
    };
    return colors[level as keyof typeof colors];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <CheckCircle2 className="w-8 h-8" />
            Générateur de Cas de Test
          </h1>
          <p className="text-muted-foreground mt-2">
            Générez des cas de test complets avec l'IA Nova QA Agent
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Nova QA Agent
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Configuration de Génération</CardTitle>
              <CardDescription>
                Fournissez l'artefact à tester et sélectionnez les niveaux de test
              </CardDescription>
            </div>
            <ContextSelector
              onContextSelected={(ctx) => {
                setContext(`Vision: ${ctx.vision}\nObjectifs: ${ctx.objectives.join(', ')}`);
                toast.success('Contexte importé');
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              onClick={() => setShowArtifactSelector(!showArtifactSelector)}
              className="flex items-center gap-2"
            >
              <Import className="w-4 h-4" />
              Importer depuis mes artefacts
            </Button>
          </div>

          {showArtifactSelector && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-base">Sélectionner des artefacts</CardTitle>
                <CardDescription>
                  Choisissez un ou plusieurs artefacts à tester
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingArtifacts ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : savedArtifacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center p-4">
                    Aucun artefact disponible (User Stories ou Epics)
                  </p>
                ) : (
                  <>
                    <ScrollArea className="h-[200px] mb-4">
                      <div className="space-y-2">
                        {savedArtifacts.map((artifact) => (
                          <div
                            key={artifact.id}
                            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <Checkbox
                              checked={selectedArtifacts.includes(artifact.id)}
                              onCheckedChange={() => handleArtifactToggle(artifact.id)}
                              id={artifact.id}
                            />
                            <label
                              htmlFor={artifact.id}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{artifact.title}</span>
                                <Badge variant="outline" className="text-xs">
                                  {artifact.artifact_type === 'story' ? 'User Story' : 'Epic'}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Créé le {new Date(artifact.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleImportArtifacts}
                        disabled={selectedArtifacts.length === 0}
                        className="flex-1"
                      >
                        Importer {selectedArtifacts.length > 0 && `(${selectedArtifacts.length})`}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowArtifactSelector(false);
                          setSelectedArtifacts([]);
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type d'artefact</label>
              <Select value={artifactType} onValueChange={(value: any) => setArtifactType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user-story">User Story</SelectItem>
                  <SelectItem value="epic">Epic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Niveaux de test</label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md">
                {['unit', 'integration', 'e2e', 'api'].map((level) => (
                  <div key={level} className="flex items-center gap-2">
                    <Checkbox
                      checked={testLevels.includes(level)}
                      onCheckedChange={() => handleTestLevelToggle(level)}
                      id={level}
                    />
                    <label htmlFor={level} className="text-sm capitalize cursor-pointer">
                      {level === 'e2e' ? 'E2E' : level === 'api' ? 'API' : level}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Contenu de l'artefact *</label>
            <Textarea
              value={artifactContent}
              onChange={(e) => setArtifactContent(e.target.value)}
              placeholder="Copiez ici votre User Story, Epic ou Spécification Technique..."
              rows={8}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Contexte additionnel (optionnel)</label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Stack technique, contraintes, dépendances..."
              rows={3}
            />
          </div>

          <Button
            onClick={generateTestCases}
            disabled={isGenerating || !artifactContent.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Générer les Cas de Test
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {testCases.length > 0 && (
        <>
          <div className="flex gap-2">
            <Button onClick={saveAsArtifact} disabled={isSaving} variant="outline">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Sauvegarder
            </Button>
          </div>

          {coverageAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Analyse de Couverture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{coverageAnalysis.totalCases}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{coverageAnalysis.byLevel.unit}</p>
                    <p className="text-sm text-muted-foreground">Unit</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{coverageAnalysis.byLevel.integration}</p>
                    <p className="text-sm text-muted-foreground">Integration</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{coverageAnalysis.byLevel.e2e}</p>
                    <p className="text-sm text-muted-foreground">E2E</p>
                  </div>
                  <div className="text-center p-4 bg-teal-50 rounded-lg">
                    <p className="text-2xl font-bold text-teal-600">{coverageAnalysis.byLevel.api}</p>
                    <p className="text-sm text-muted-foreground">API</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Score de Couverture</span>
                    <span className="text-2xl font-bold text-primary">{coverageAnalysis.coverageScore}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-gradient-primary h-3 rounded-full transition-all duration-500"
                      style={{ width: `${coverageAnalysis.coverageScore}%` }}
                    />
                  </div>
                </div>

                {coverageAnalysis.missingScenarios.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <h4 className="text-sm font-semibold">Scénarios Manquants Suggérés</h4>
                    </div>
                    <ul className="text-sm space-y-1">
                      {coverageAnalysis.missingScenarios.map((scenario, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-yellow-600">•</span>
                          <span className="text-muted-foreground">{scenario}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="test-cases">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="test-cases">
                <FileText className="w-4 h-4 mr-2" />
                Cas de Test ({testCases.length})
              </TabsTrigger>
              <TabsTrigger value="automation">
                <Code className="w-4 h-4 mr-2" />
                Scripts d'Automatisation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="test-cases" className="space-y-4">
              <ScrollArea className="h-[600px]">
                {testCases.map((testCase) => (
                  <Card key={testCase.id} className="mb-4">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {testCase.id}: {testCase.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {testCase.description}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getLevelColor(testCase.level)}>
                            {testCase.level}
                          </Badge>
                          <Badge className={getPriorityColor(testCase.priority)}>
                            {testCase.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {testCase.preconditions && testCase.preconditions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Préconditions</h4>
                          <ul className="text-sm space-y-1">
                            {testCase.preconditions.map((pre, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span>{pre}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-semibold mb-1">Étapes</h4>
                        <ol className="text-sm space-y-1">
                          {(testCase.steps || []).map((step, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary font-medium">{i + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold mb-1">Résultats Attendus</h4>
                        <p className="text-sm text-muted-foreground">{testCase.expectedResults}</p>
                      </div>

                      {testCase.testData && (
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Données de Test</h4>
                          <p className="text-sm text-muted-foreground">{testCase.testData}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          {testCase.automatable && (
                            <Badge variant="outline" className="text-xs">
                              <Code className="w-3 h-3 mr-1" />
                              Automatable
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Effort: {testCase.estimatedEffort}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="automation">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Template d'Automatisation
                  </CardTitle>
                  <CardDescription>
                    Script Playwright/Jest généré automatiquement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {automationScript ? (
                    <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                      <code>{automationScript}</code>
                    </pre>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Aucun script d'automatisation généré
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};