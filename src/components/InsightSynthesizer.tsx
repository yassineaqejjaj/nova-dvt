import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Loader2,
  Sparkles,
  Store,
  Users,
  AlertTriangle,
  TrendingUp,
  Target,
  Lightbulb,
  FileText,
  CheckCircle2,
  Code,
  ArrowRight,
  Save,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from 'lucide-react';

interface StoreReview {
  source: 'apple_store' | 'google_play';
  rating: number;
  content: string;
  date?: string;
}

interface BusinessRequest {
  source: string;
  content: string;
  frequency?: 'low' | 'medium' | 'high';
  strategic_level?: 'short_term' | 'long_term';
}

interface Incident {
  title: string;
  severity: 'P1' | 'P2' | 'P3' | 'P4';
  frequency: number;
  impact_business?: string;
  impact_user?: string;
  trend?: 'rising' | 'stable' | 'declining';
}

interface UserStory {
  story: string;
  acceptanceCriteria: string[];
}

interface Epic {
  title: string;
  description: string;
  userStories: UserStory[];
  technicalPrerequisites: string[];
}

interface RoadmapRecommendation {
  title: string;
  impact: 'très fort' | 'fort' | 'moyen' | 'faible';
  effort: 'très élevé' | 'élevé' | 'moyen' | 'faible';
  kpis: string[];
  action: string;
}

interface PriorityTheme {
  rank: number;
  theme: string;
  supportedBy: string[];
  category: string;
}

interface Synthesis {
  globalSynthesis: {
    storeInsights: string;
    businessInsights: string;
    incidentInsights: string;
  };
  priorityThemes: PriorityTheme[];
  importance: Array<{ point: string; metric?: string }>;
  expectedValue: string[];
  roadmapRecommendations: RoadmapRecommendation[];
  epics: Epic[];
}

interface InsightSynthesizerProps {
  open: boolean;
  onClose: () => void;
}

export const InsightSynthesizer: React.FC<InsightSynthesizerProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState('input');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [synthesis, setSynthesis] = useState<Synthesis | null>(null);
  const [expandedEpics, setExpandedEpics] = useState<Set<number>>(new Set());
  
  // Input states
  const [storeReviewsInput, setStoreReviewsInput] = useState('');
  const [businessRequestsInput, setBusinessRequestsInput] = useState('');
  const [incidentsInput, setIncidentsInput] = useState('');
  const [productContext, setProductContext] = useState('');

  const parseStoreReviews = (input: string): StoreReview[] => {
    if (!input.trim()) return [];
    try {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // Parse line by line as simple format
      return input.split('\n').filter(line => line.trim()).map(line => {
        const ratingMatch = line.match(/(\d)\/5|★(\d)/);
        const rating = ratingMatch ? parseInt(ratingMatch[1] || ratingMatch[2]) : 3;
        return {
          source: line.toLowerCase().includes('google') ? 'google_play' : 'apple_store',
          rating,
          content: line.replace(/(\d\/5|★\d)/g, '').trim()
        };
      });
    }
  };

  const parseBusinessRequests = (input: string): BusinessRequest[] => {
    if (!input.trim()) return [];
    try {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return input.split('\n').filter(line => line.trim()).map(line => {
        const sourceMatch = line.match(/^\[(.*?)\]/);
        return {
          source: sourceMatch ? sourceMatch[1] : 'General',
          content: sourceMatch ? line.replace(/^\[.*?\]/, '').trim() : line.trim()
        };
      });
    }
  };

  const parseIncidents = (input: string): Incident[] => {
    if (!input.trim()) return [];
    try {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return input.split('\n').filter(line => line.trim()).map(line => {
        const severityMatch = line.match(/P([1-4])/i);
        return {
          title: line.replace(/P[1-4]/gi, '').trim(),
          severity: severityMatch ? `P${severityMatch[1]}` as 'P1' | 'P2' | 'P3' | 'P4' : 'P3',
          frequency: 1
        };
      });
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const storeReviews = parseStoreReviews(storeReviewsInput);
      const businessRequests = parseBusinessRequests(businessRequestsInput);
      const incidents = parseIncidents(incidentsInput);

      if (storeReviews.length === 0 && businessRequests.length === 0 && incidents.length === 0) {
        toast.error('Veuillez renseigner au moins une source de données');
        return;
      }

      const { data, error } = await supabase.functions.invoke('synthesize-insights', {
        body: {
          storeReviews,
          businessRequests,
          incidents,
          productContext
        }
      });

      if (error) throw error;

      if (data?.synthesis) {
        setSynthesis(data.synthesis);
        setActiveTab('synthesis');
        toast.success('Synthèse générée avec succès');
      }
    } catch (error) {
      console.error('Error generating synthesis:', error);
      toast.error('Erreur lors de la génération de la synthèse');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveArtifact = async (type: 'report' | 'recommendations' | 'epics') => {
    if (!synthesis) return;
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vous devez être connecté');
        return;
      }

      let content;
      let title;
      
      switch (type) {
        case 'report':
          title = 'Insight Synthesis Report';
          content = {
            globalSynthesis: synthesis.globalSynthesis,
            priorityThemes: synthesis.priorityThemes,
            importance: synthesis.importance,
            expectedValue: synthesis.expectedValue
          };
          break;
        case 'recommendations':
          title = 'Roadmap Recommendations';
          content = { recommendations: synthesis.roadmapRecommendations };
          break;
        case 'epics':
          title = 'Generated Epics & User Stories';
          content = { epics: synthesis.epics };
          break;
      }

      const { error } = await supabase.from('artifacts').insert({
        user_id: user.id,
        title,
        artifact_type: type === 'epics' ? 'epic' : 'canvas',
        content,
        metadata: {
          source: 'insight-synthesizer',
          generatedAt: new Date().toISOString()
        }
      });

      if (error) throw error;
      toast.success(`${title} sauvegardé`);
    } catch (error) {
      console.error('Error saving artifact:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEpic = (index: number) => {
    const newExpanded = new Set(expandedEpics);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEpics(newExpanded);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'très fort': return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30';
      case 'fort': return 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30';
      case 'moyen': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'très élevé': return 'bg-purple-500/20 text-purple-700 dark:text-purple-400';
      case 'élevé': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'moyen': return 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400';
      default: return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'friction': return 'bg-red-500/20 text-red-700 dark:text-red-400';
      case 'opportunité': return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'dette_ux': return 'bg-orange-500/20 text-orange-700 dark:text-orange-400';
      case 'dette_tech': return 'bg-purple-500/20 text-purple-700 dark:text-purple-400';
      case 'accompagnement': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-4 z-50 overflow-hidden bg-background rounded-lg border shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Insight Synthesizer</h2>
              <p className="text-sm text-muted-foreground">
                Transformez vos données en recommandations roadmap actionnables
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="input" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Sources
                </TabsTrigger>
                <TabsTrigger value="synthesis" disabled={!synthesis}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Synthèse
                </TabsTrigger>
                <TabsTrigger value="recommendations" disabled={!synthesis}>
                  <Target className="w-4 h-4 mr-2" />
                  Recommandations
                </TabsTrigger>
                <TabsTrigger value="epics" disabled={!synthesis}>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Epics & Stories
                </TabsTrigger>
                <TabsTrigger value="tech" disabled={!synthesis}>
                  <Code className="w-4 h-4 mr-2" />
                  Prérequis Tech
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 p-6">
              {/* Input Tab */}
              <TabsContent value="input" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Store Reviews */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Store className="w-5 h-5 text-blue-500" />
                        Avis App Stores
                      </CardTitle>
                      <CardDescription>
                        Commentaires Apple Store & Google Play
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={storeReviewsInput}
                        onChange={(e) => setStoreReviewsInput(e.target.value)}
                        placeholder={`Exemple format simple:
Apple 3/5 L'app crash souvent au login
Google 2/5 Temps de chargement trop long
Apple 4/5 Bonne app mais onboarding confus

Ou format JSON:
[{"source": "apple_store", "rating": 3, "content": "..."}]`}
                        className="min-h-[200px] font-mono text-sm"
                      />
                    </CardContent>
                  </Card>

                  {/* Business Requests */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="w-5 h-5 text-green-500" />
                        Demandes Métiers
                      </CardTitle>
                      <CardDescription>
                        Feedback internes (PM, PO, Support, etc.)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={businessRequestsInput}
                        onChange={(e) => setBusinessRequestsInput(e.target.value)}
                        placeholder={`Exemple format simple:
[PM] Besoin d'un parcours simplifié pour débutants
[Support] Beaucoup de tickets sur le reset password
[Marketing] Demande de partage social dans l'app

Ou format JSON:
[{"source": "PM", "content": "...", "frequency": "high"}]`}
                        className="min-h-[200px] font-mono text-sm"
                      />
                    </CardContent>
                  </Card>

                  {/* Incidents */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Incidents
                      </CardTitle>
                      <CardDescription>
                        Tickets avec sévérité et impact
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={incidentsInput}
                        onChange={(e) => setIncidentsInput(e.target.value)}
                        placeholder={`Exemple format simple:
P1 Crash module authentification
P2 Erreur 500 sur la page profil
P3 Lenteur du dashboard analytics

Ou format JSON:
[{"title": "...", "severity": "P1", "frequency": 15}]`}
                        className="min-h-[200px] font-mono text-sm"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Product Context */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Contexte Produit (optionnel)</CardTitle>
                    <CardDescription>
                      Ajoutez du contexte pour une analyse plus pertinente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={productContext}
                      onChange={(e) => setProductContext(e.target.value)}
                      placeholder="Ex: Application mobile B2C de fitness, 500k utilisateurs actifs, focus Q1 sur la rétention..."
                      className="min-h-[80px]"
                    />
                  </CardContent>
                </Card>

                {/* Generate Button */}
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-8"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyse en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Générer la Synthèse
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* Synthesis Tab */}
              <TabsContent value="synthesis" className="mt-0 space-y-6">
                {synthesis && (
                  <>
                    {/* Global Synthesis */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Synthèse Globale
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSaveArtifact('report')}
                            disabled={isSaving}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Sauvegarder
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {synthesis.globalSynthesis.storeInsights && (
                          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Store className="w-4 h-4 text-blue-500" />
                              <span className="font-medium">Retours Stores</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{synthesis.globalSynthesis.storeInsights}</p>
                          </div>
                        )}
                        {synthesis.globalSynthesis.businessInsights && (
                          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="w-4 h-4 text-green-500" />
                              <span className="font-medium">Demandes Métiers</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{synthesis.globalSynthesis.businessInsights}</p>
                          </div>
                        )}
                        {synthesis.globalSynthesis.incidentInsights && (
                          <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              <span className="font-medium">Incidents</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{synthesis.globalSynthesis.incidentInsights}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Priority Themes */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Thèmes Prioritaires
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {synthesis.priorityThemes.map((theme, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                                {theme.rank}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold">{theme.theme}</span>
                                  <Badge variant="outline" className={getCategoryColor(theme.category)}>
                                    {theme.category}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {theme.supportedBy.map((source, sIdx) => (
                                    <Badge key={sIdx} variant="secondary" className="text-xs">
                                      {source}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Importance & Value */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Pourquoi c'est Important</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {synthesis.importance.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                <div>
                                  <span>{item.point}</span>
                                  {item.metric && (
                                    <Badge variant="outline" className="ml-2 text-xs">{item.metric}</Badge>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Valeur Attendue</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {synthesis.expectedValue.map((value, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                <span>{value}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations" className="mt-0 space-y-6">
                {synthesis && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          Recommandations Roadmap
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSaveArtifact('recommendations')}
                          disabled={isSaving}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Sauvegarder
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {synthesis.roadmapRecommendations.map((rec, idx) => (
                          <div key={idx} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold text-lg">{rec.title}</h4>
                              <div className="flex gap-2">
                                <Badge className={getImpactColor(rec.impact)}>
                                  Impact: {rec.impact}
                                </Badge>
                                <Badge className={getEffortColor(rec.effort)}>
                                  Effort: {rec.effort}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {rec.kpis.map((kpi, kIdx) => (
                                <Badge key={kIdx} variant="outline" className="text-xs">
                                  {kpi}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 text-sm bg-primary/5 p-3 rounded-lg">
                              <ArrowRight className="w-4 h-4 text-primary" />
                              <span className="font-medium">{rec.action}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Epics Tab */}
              <TabsContent value="epics" className="mt-0 space-y-6">
                {synthesis && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5" />
                          Epics & User Stories Générés
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSaveArtifact('epics')}
                          disabled={isSaving}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Sauvegarder
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {synthesis.epics.map((epic, idx) => (
                          <div key={idx} className="border rounded-lg overflow-hidden">
                            <button
                              onClick={() => toggleEpic(idx)}
                              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <FileText className="w-4 h-4 text-primary" />
                                </div>
                                <div className="text-left">
                                  <h4 className="font-semibold">Epic {idx + 1}: {epic.title}</h4>
                                  <p className="text-sm text-muted-foreground line-clamp-1">{epic.description}</p>
                                </div>
                              </div>
                              {expandedEpics.has(idx) ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                            
                            {expandedEpics.has(idx) && (
                              <div className="px-4 pb-4 space-y-4">
                                <Separator />
                                
                                <div>
                                  <h5 className="font-medium mb-2">Description</h5>
                                  <p className="text-sm text-muted-foreground">{epic.description}</p>
                                </div>

                                <div>
                                  <h5 className="font-medium mb-3">User Stories</h5>
                                  <div className="space-y-3">
                                    {epic.userStories.map((story, sIdx) => (
                                      <div key={sIdx} className="p-3 bg-muted/50 rounded-lg">
                                        <p className="text-sm font-medium mb-2">{story.story}</p>
                                        <div className="space-y-1">
                                          <span className="text-xs font-medium text-muted-foreground">Critères d'acceptation:</span>
                                          <ul className="text-xs space-y-1">
                                            {story.acceptanceCriteria.map((ac, acIdx) => (
                                              <li key={acIdx} className="flex items-start gap-2">
                                                <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                                                <span>{ac}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Tech Prerequisites Tab */}
              <TabsContent value="tech" className="mt-0 space-y-6">
                {synthesis && (
                  <div className="space-y-4">
                    {synthesis.epics.map((epic, idx) => (
                      <Card key={idx}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Code className="w-5 h-5" />
                            {epic.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {epic.technicalPrerequisites.map((prereq, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-2 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                <span>{prereq}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
