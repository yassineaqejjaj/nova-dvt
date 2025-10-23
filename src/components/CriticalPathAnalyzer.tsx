import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, 
  Save, 
  Sparkles, 
  AlertTriangle,
  TrendingUp,
  GitBranch,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Artifact {
  id: string;
  title: string;
  artifact_type: string;
  content: any;
  created_at: string;
}

interface CriticalPath {
  id: string;
  name: string;
  riskLevel: 'high' | 'medium' | 'low';
  impactedFeatures: string[];
  dependencies: string[];
  testingPriority: number;
  reasoning: string;
  suggestedTests: string[];
}

interface RiskAnalysis {
  totalPaths: number;
  criticalPaths: CriticalPath[];
  coverageRecommendations: string[];
  estimatedTestEffort: string;
}

export const CriticalPathAnalyzer = () => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [selectedArtifacts, setSelectedArtifacts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadArtifacts();
  }, []);

  const loadArtifacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Veuillez vous connecter');
        return;
      }

      const { data, error } = await supabase
        .from('artifacts')
        .select('*')
        .eq('user_id', user.id)
        .in('artifact_type', ['epic', 'story', 'canvas'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      setArtifacts(data || []);
    } catch (error) {
      console.error('Error loading artifacts:', error);
      toast.error('Erreur lors du chargement des artefacts');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleArtifact = (id: string) => {
    setSelectedArtifacts(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const analyzeRisks = async () => {
    if (selectedArtifacts.length === 0) {
      toast.error('Sélectionnez au moins un artefact');
      return;
    }

    setIsAnalyzing(true);
    try {
      const selectedData = artifacts.filter(a => selectedArtifacts.includes(a.id));
      
      const { data, error } = await supabase.functions.invoke('analyze-critical-paths', {
        body: {
          artifacts: selectedData.map(a => ({
            type: a.artifact_type,
            title: a.title,
            content: a.content
          }))
        }
      });

      if (error) throw error;

      setRiskAnalysis(data);
      toast.success('Analyse des chemins critiques terminée!');
    } catch (error: any) {
      console.error('Error analyzing critical paths:', error);
      toast.error(error.message || 'Erreur lors de l\'analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAsArtifact = async () => {
    if (!riskAnalysis) {
      toast.error('Aucune analyse à sauvegarder');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.from('artifacts').insert({
        user_id: user.id,
        artifact_type: 'canvas' as const,
        title: `Analyse Chemins Critiques - ${new Date().toLocaleDateString('fr-FR')}`,
        content: { 
          riskAnalysis,
          selectedArtifacts: artifacts.filter(a => selectedArtifacts.includes(a.id)),
          generatedAt: new Date().toISOString()
        },
        metadata: { type: 'critical-path-analysis' }
      } as any);

      if (error) throw error;
      toast.success('Analyse sauvegardée dans les artefacts!');
    } catch (error) {
      console.error('Error saving artifact:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[risk as keyof typeof colors];
  };

  const getArtifactIcon = (type: string) => {
    switch (type) {
      case 'epic':
        return '📚';
      case 'story':
        return '📝';
      case 'canvas':
        return '🎨';
      default:
        return '📄';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <GitBranch className="w-8 h-8" />
            Analyse des Chemins Critiques
          </h1>
          <p className="text-muted-foreground mt-2">
            Identifiez les flux à risque et priorisez vos tests avec Nova QA Agent
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Nova QA Agent
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sélection des Artefacts</CardTitle>
          <CardDescription>
            Sélectionnez les Epics et User Stories à analyser
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : artifacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun artefact disponible</p>
              <p className="text-sm mt-2">Créez des Epics ou User Stories pour commencer</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {artifacts.map((artifact) => (
                  <div
                    key={artifact.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedArtifacts.includes(artifact.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => toggleArtifact(artifact.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedArtifacts.includes(artifact.id)}
                        onCheckedChange={() => toggleArtifact(artifact.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getArtifactIcon(artifact.artifact_type)}</span>
                          <h4 className="font-semibold">{artifact.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {artifact.artifact_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Créé le {new Date(artifact.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedArtifacts.length} artefact(s) sélectionné(s)
            </p>
            <Button
              onClick={analyzeRisks}
              disabled={isAnalyzing || selectedArtifacts.length === 0}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyser les Risques
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {riskAnalysis && (
        <>
          <div className="flex gap-2">
            <Button onClick={saveAsArtifact} disabled={isSaving} variant="outline">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Sauvegarder l'Analyse
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Vue d'Ensemble des Risques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{riskAnalysis.totalPaths}</p>
                  <p className="text-sm text-muted-foreground">Chemins Total</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {riskAnalysis.criticalPaths.filter(p => p.riskLevel === 'high').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Risque Élevé</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {riskAnalysis.criticalPaths.filter(p => p.riskLevel === 'medium').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Risque Moyen</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {riskAnalysis.criticalPaths.filter(p => p.riskLevel === 'low').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Risque Faible</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <h4 className="font-semibold text-sm">Effort de Test Estimé</h4>
                <p className="text-muted-foreground">{riskAnalysis.estimatedTestEffort}</p>
              </div>

              {riskAnalysis.coverageRecommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Recommandations de Couverture</h4>
                  <ul className="space-y-2">
                    {riskAnalysis.coverageRecommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span className="text-sm text-muted-foreground">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Chemins Critiques Identifiés</h3>
            <ScrollArea className="h-[600px]">
              {riskAnalysis.criticalPaths
                .sort((a, b) => b.testingPriority - a.testingPriority)
                .map((path) => (
                  <Card key={path.id} className="mb-4">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            <GitBranch className="w-4 h-4" />
                            {path.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {path.reasoning}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge className={getRiskColor(path.riskLevel)}>
                            {path.riskLevel === 'high' ? 'Risque Élevé' : 
                             path.riskLevel === 'medium' ? 'Risque Moyen' : 'Risque Faible'}
                          </Badge>
                          <Badge variant="outline">
                            Priorité: {path.testingPriority}/10
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Features Impactées</h4>
                        <div className="flex flex-wrap gap-2">
                          {path.impactedFeatures.map((feature, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {path.dependencies?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Dépendances</h4>
                          <div className="flex flex-wrap gap-2">
                            {path.dependencies.map((dep, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {dep}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {path.suggestedTests.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            Tests Suggérés
                          </h4>
                          <ul className="space-y-1">
                            {path.suggestedTests.map((test, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="text-primary">→</span>
                                <span className="text-muted-foreground">{test}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
};
