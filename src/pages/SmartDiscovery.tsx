import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ContextSelector } from '@/components/ContextSelector';
import StoryCard from '@/components/StoryCard';
import StoryGenerationModal from '@/components/StoryGenerationModal';
import StoryReviewModal from '@/components/StoryReviewModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Edit3,
  RefreshCw,
  Rocket,
  Copy,
  CheckCircle2,
  Target,
  Users,
  Lightbulb,
  FileText,
} from 'lucide-react';

interface ProductContext {
  id: string;
  name: string;
  vision?: string;
  objectives?: any[];
  target_kpis?: any[];
  target_audience?: string;
  constraints?: string;
}

interface Epic {
  id: string;
  title: string;
  description: string;
  context?: string;
  problem?: string;
  targetUsers?: string[];
  hypothesis?: string;
  successMetrics?: string[];
  risks?: string[];
  estimatedValue?: string;
}

interface UserStory {
  id: string;
  epicId: string;
  title: string;
  story: {
    asA: string;
    iWant: string;
    soThat: string;
  };
  acceptanceCriteria: string[];
  effortPoints: number;
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  technicalNotes?: string;
  status: 'draft' | 'ready' | 'in_progress' | 'done';
  tags: string[];
}

type ViewState = 'input' | 'epic' | 'stories';

const SmartDiscovery = () => {
  const navigate = useNavigate();
  
  // Input state
  const [ideaDescription, setIdeaDescription] = useState('');
  const [activeContext, setActiveContext] = useState<ProductContext | null>(null);
  const [isGeneratingEpic, setIsGeneratingEpic] = useState(false);
  
  // Epic state
  const [generatedEpic, setGeneratedEpic] = useState<Epic | null>(null);
  const [isEditingEpic, setIsEditingEpic] = useState(false);
  const [editedEpic, setEditedEpic] = useState<Epic | null>(null);
  
  // Stories state
  const [currentView, setCurrentView] = useState<ViewState>('input');
  const [showStoryGenerationModal, setShowStoryGenerationModal] = useState(false);
  const [showStoryReviewModal, setShowStoryReviewModal] = useState(false);
  const [generatedStories, setGeneratedStories] = useState<UserStory[]>([]);
  const [savedStories, setSavedStories] = useState<UserStory[]>([]);
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());
  
  // Save state
  const [isSaving, setIsSaving] = useState(false);

  const handleAnalyze = async () => {
    if (!ideaDescription.trim()) {
      toast.error('Décrivez votre idée avant de générer');
      return;
    }

    setIsGeneratingEpic(true);

    try {
      const contextInfo = activeContext
        ? `
Contexte Produit: ${activeContext.name}
Vision: ${activeContext.vision || 'Non définie'}
Audience cible: ${activeContext.target_audience || 'Non définie'}
Contraintes: ${activeContext.constraints || 'Aucune'}
`
        : '';

      const systemPrompt = `Tu es un expert Product Manager. Analyse l'idée fournie et génère un Epic structuré.
              
RÉPONDS UNIQUEMENT EN JSON avec cette structure exacte:
{
  "title": "Titre court de l'Epic",
  "description": "Description complète de l'Epic (2-3 phrases)",
  "problem": "Le problème que cette feature résout",
  "targetUsers": ["Persona 1", "Persona 2"],
  "hypothesis": "Si nous implémentons X, alors Y parce que Z",
  "successMetrics": ["Métrique 1", "Métrique 2", "Métrique 3"],
  "risks": ["Risque 1", "Risque 2"],
  "estimatedValue": "Impact business attendu"
}

Assure-toi que l'Epic est actionnable, mesurable et aligné avec les bonnes pratiques produit.`;

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `${contextInfo}\n\nIdée à analyser:\n${ideaDescription}`,
          systemPrompt
        }
      });

      if (error) throw error;

      let parsed: any = null;
      const content = data?.response || data?.content || '';
      
      try {
        parsed = JSON.parse(content);
      } catch {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      }

      if (!parsed || !parsed.title) {
        throw new Error('Format de réponse invalide');
      }

      const epic: Epic = {
        id: crypto.randomUUID(),
        title: parsed.title,
        description: parsed.description,
        context: ideaDescription,
        problem: parsed.problem,
        targetUsers: parsed.targetUsers || [],
        hypothesis: parsed.hypothesis,
        successMetrics: parsed.successMetrics || [],
        risks: parsed.risks || [],
        estimatedValue: parsed.estimatedValue
      };

      setGeneratedEpic(epic);
      setEditedEpic(epic);
      setCurrentView('epic');
      toast.success('Epic généré avec succès !');
    } catch (error) {
      console.error('Error generating epic:', error);
      toast.error('Échec de la génération. Réessayez.');
    } finally {
      setIsGeneratingEpic(false);
    }
  };

  const handleRegenerateEpic = async () => {
    await handleAnalyze();
  };

  const handleSaveEpicEdits = () => {
    if (editedEpic) {
      setGeneratedEpic(editedEpic);
      setIsEditingEpic(false);
      toast.success('Epic mis à jour');
    }
  };

  const handleShipToDev = () => {
    if (!generatedEpic) return;
    setShowStoryGenerationModal(true);
  };

  const handleStoriesGenerated = (stories: UserStory[]) => {
    setGeneratedStories(stories);
    setShowStoryGenerationModal(false);
    setShowStoryReviewModal(true);
  };

  const handleSaveStories = async (stories: UserStory[]) => {
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Save Epic as artifact
      const { error: epicError } = await supabase
        .from('artifacts')
        .insert({
          user_id: user.id,
          artifact_type: 'epic' as const,
          title: generatedEpic!.title,
          content: {
            type: 'smart_discovery_epic',
            epic: generatedEpic,
            sourceIdea: ideaDescription
          } as any,
          product_context_id: activeContext?.id || null
        });

      if (epicError) throw epicError;

      // Save User Stories as artifact
      const { error: storiesError } = await supabase
        .from('artifacts')
        .insert({
          user_id: user.id,
          artifact_type: 'story' as const,
          title: `User Stories - ${generatedEpic!.title}`,
          content: {
            type: 'user_stories',
            epic: generatedEpic,
            stories: stories
          } as any,
          product_context_id: activeContext?.id || null
        });

      if (storiesError) throw storiesError;

      setSavedStories(stories);
      setShowStoryReviewModal(false);
      setCurrentView('stories');
      toast.success(`Epic et ${stories.length} User Stories sauvegardés !`);
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Échec de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStoryExpand = (storyId: string) => {
    setExpandedStories(prev => {
      const next = new Set(prev);
      if (next.has(storyId)) {
        next.delete(storyId);
      } else {
        next.add(storyId);
      }
      return next;
    });
  };

  const handleStartOver = () => {
    setIdeaDescription('');
    setGeneratedEpic(null);
    setEditedEpic(null);
    setGeneratedStories([]);
    setSavedStories([]);
    setCurrentView('input');
  };

  const copyEpicToClipboard = () => {
    if (!generatedEpic) return;
    
    const text = `# ${generatedEpic.title}

## Description
${generatedEpic.description}

## Problème
${generatedEpic.problem}

## Utilisateurs cibles
${generatedEpic.targetUsers?.join(', ')}

## Hypothèse
${generatedEpic.hypothesis}

## Métriques de succès
${generatedEpic.successMetrics?.map(m => `- ${m}`).join('\n')}

## Risques
${generatedEpic.risks?.map(r => `- ${r}`).join('\n')}

## Valeur estimée
${generatedEpic.estimatedValue}`;
    
    navigator.clipboard.writeText(text);
    toast.success('Epic copié dans le presse-papier');
  };

  const totalPoints = savedStories.reduce((sum, s) => sum + s.effortPoints, 0);
  const estimatedSprints = Math.ceil(totalPoints / 20);

  // Render Input View
  if (currentView === 'input') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                Smart Discovery Canvas
              </h1>
              <p className="text-muted-foreground">
                Transformez une idée floue en Epic validé avec User Stories
              </p>
            </div>
          </div>

          {/* Context Selector */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Contexte Produit
              </CardTitle>
              <CardDescription>
                Sélectionnez un contexte pour enrichir l'analyse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContextSelector
                selectedContextId={activeContext?.id}
                onContextSelected={setActiveContext}
              />
            </CardContent>
          </Card>

          {/* Main Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Décrivez votre idée
              </CardTitle>
              <CardDescription>
                Collez le message d'un stakeholder, décrivez une fonctionnalité, ou partagez une idée brute
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Ex: Les utilisateurs se plaignent de ne pas pouvoir exporter leurs données facilement. On devrait leur permettre d'exporter en CSV et PDF depuis leur tableau de bord..."
                value={ideaDescription}
                onChange={(e) => setIdeaDescription(e.target.value)}
                rows={8}
                className="resize-none"
              />
              
              <Button 
                onClick={handleAnalyze}
                disabled={isGeneratingEpic || !ideaDescription.trim()}
                className="w-full"
                size="lg"
              >
                {isGeneratingEpic ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analyser avec Nova
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render Epic View
  if (currentView === 'epic' && generatedEpic) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4 max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleStartOver}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Epic généré</h1>
                <p className="text-muted-foreground">
                  Revoyez et modifiez avant de passer aux User Stories
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyEpicToClipboard}>
                <Copy className="mr-2 h-4 w-4" />
                Copier
              </Button>
              <Button variant="outline" onClick={handleRegenerateEpic} disabled={isGeneratingEpic}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isGeneratingEpic ? 'animate-spin' : ''}`} />
                Régénérer
              </Button>
            </div>
          </div>

          {/* Epic Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {isEditingEpic ? (
                    <Input
                      value={editedEpic?.title || ''}
                      onChange={(e) => setEditedEpic(prev => prev ? { ...prev, title: e.target.value } : null)}
                      className="text-2xl font-bold mb-2"
                    />
                  ) : (
                    <CardTitle className="text-2xl">{generatedEpic.title}</CardTitle>
                  )}
                  {activeContext && (
                    <Badge variant="secondary" className="mt-2">
                      {activeContext.name}
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    if (isEditingEpic) {
                      handleSaveEpicEdits();
                    } else {
                      setIsEditingEpic(true);
                    }
                  }}
                >
                  {isEditingEpic ? <CheckCircle2 className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </h3>
                {isEditingEpic ? (
                  <Textarea
                    value={editedEpic?.description || ''}
                    onChange={(e) => setEditedEpic(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={3}
                  />
                ) : (
                  <p className="text-foreground">{generatedEpic.description}</p>
                )}
              </div>

              <Separator />

              {/* Problem */}
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Problème adressé
                </h3>
                {isEditingEpic ? (
                  <Textarea
                    value={editedEpic?.problem || ''}
                    onChange={(e) => setEditedEpic(prev => prev ? { ...prev, problem: e.target.value } : null)}
                    rows={2}
                  />
                ) : (
                  <p className="text-foreground">{generatedEpic.problem}</p>
                )}
              </div>

              {/* Target Users */}
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Utilisateurs cibles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {generatedEpic.targetUsers?.map((user, idx) => (
                    <Badge key={idx} variant="outline">{user}</Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Hypothesis */}
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Hypothèse
                </h3>
                {isEditingEpic ? (
                  <Textarea
                    value={editedEpic?.hypothesis || ''}
                    onChange={(e) => setEditedEpic(prev => prev ? { ...prev, hypothesis: e.target.value } : null)}
                    rows={2}
                  />
                ) : (
                  <p className="text-foreground italic">{generatedEpic.hypothesis}</p>
                )}
              </div>

              {/* Success Metrics */}
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Métriques de succès</h3>
                <ul className="space-y-1">
                  {generatedEpic.successMetrics?.map((metric, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {metric}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risks */}
              {generatedEpic.risks && generatedEpic.risks.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Risques identifiés</h3>
                  <ul className="space-y-1">
                    {generatedEpic.risks.map((risk, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-amber-600">
                        <span>⚠️</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Estimated Value */}
              {generatedEpic.estimatedValue && (
                <div className="bg-primary/5 rounded-lg p-4">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Valeur estimée</h3>
                  <p className="text-foreground font-medium">{generatedEpic.estimatedValue}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ship to Dev Button */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Prêt à transformer en User Stories ?</h3>
                  <p className="text-muted-foreground text-sm">
                    Nova va découper cet Epic en User Stories actionnables
                  </p>
                </div>
                <Button onClick={handleShipToDev} size="lg">
                  <Rocket className="mr-2 h-5 w-5" />
                  Ship to Dev
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Story Generation Modal */}
        {generatedEpic && (
          <StoryGenerationModal
            epic={{
              id: generatedEpic.id,
              title: generatedEpic.title,
              description: generatedEpic.description,
              context: generatedEpic.context
            }}
            open={showStoryGenerationModal}
            onClose={() => setShowStoryGenerationModal(false)}
            onGenerate={handleStoriesGenerated}
          />
        )}

        {/* Story Review Modal */}
        {generatedEpic && (
          <StoryReviewModal
            epic={{
              id: generatedEpic.id,
              title: generatedEpic.title,
              description: generatedEpic.description,
              context: generatedEpic.context
            }}
            generatedStories={generatedStories}
            open={showStoryReviewModal}
            onClose={() => setShowStoryReviewModal(false)}
            onSave={handleSaveStories}
          />
        )}
      </div>
    );
  }

  // Render Stories View
  if (currentView === 'stories' && savedStories.length > 0) {
    const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
    const sortedStories = [...savedStories].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4 max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setCurrentView('epic')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">User Stories sauvegardées</h1>
                <p className="text-muted-foreground">
                  Epic: {generatedEpic?.title}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-base py-1 px-3">
                {savedStories.length} stories
              </Badge>
              <Badge variant="outline" className="text-base py-1 px-3">
                {totalPoints} pts
              </Badge>
              <Badge variant="outline" className="text-base py-1 px-3">
                ~{estimatedSprints} sprints
              </Badge>
            </div>
          </div>

          {/* Success Banner */}
          <Card className="mb-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Epic et User Stories sauvegardés !
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Retrouvez-les dans vos Artefacts{activeContext ? `, liés au contexte "${activeContext.name}"` : ''}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stories List */}
          <Card>
            <CardHeader>
              <CardTitle>User Stories ({savedStories.length})</CardTitle>
              <CardDescription>
                Triées par priorité : Haute → Moyenne → Basse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedStories.map(story => (
                <StoryCard
                  key={story.id}
                  story={story}
                  expanded={expandedStories.has(story.id)}
                  onToggleExpand={() => toggleStoryExpand(story.id)}
                />
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handleStartOver}>
              <Sparkles className="mr-2 h-4 w-4" />
              Nouvelle Discovery
            </Button>
            <Button onClick={() => navigate('/')}>
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
};

export default SmartDiscovery;
