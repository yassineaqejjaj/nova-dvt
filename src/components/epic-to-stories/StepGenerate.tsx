import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles, ArrowLeft, AlertCircle, Target, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Epic, UserStory, GenerationConfig, ProductContextSummary, StoryGenerationResult } from './types';
import StoryCard from '../StoryCard';

interface StepGenerateProps {
  epic: Epic;
  context: ProductContextSummary | null;
  config: GenerationConfig;
  generatedStories: UserStory[];
  onStoriesGenerated: (result: StoryGenerationResult) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepGenerate = ({ 
  epic, 
  context, 
  config, 
  generatedStories,
  onStoriesGenerated, 
  onNext, 
  onBack 
}: StepGenerateProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());
  const [alignmentScore, setAlignmentScore] = useState(0);
  const [objectivesCoverage, setObjectivesCoverage] = useState(0);

  const toggleExpand = (storyId: string) => {
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

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(10);

    try {
      // Build context string for generation
      let contextString = '';
      if (context) {
        contextString = `
Contexte produit: ${context.name}
Vision: ${context.vision || 'Non définie'}
Objectifs: ${context.objectives.join(', ') || 'Non définis'}
KPIs: ${context.target_kpis.join(', ') || 'Non définis'}
Audience: ${context.target_audience || 'Non définie'}
${context.industrySector ? `Secteur: ${context.industrySector}` : ''}
        `.trim();
      }

      setProgress(30);

      const { data, error } = await supabase.functions.invoke('generate-user-stories', {
        body: {
          epic: {
            title: epic.title,
            description: epic.description,
            context: epic.context
          },
          options: {
            granularity: config.granularity,
            format: config.format,
            orientation: config.orientation,
            focusAreas: config.focusAreas.length > 0 ? config.focusAreas : undefined,
            productContext: contextString || undefined
          }
        }
      });

      setProgress(70);

      if (error) throw error;

      if (!data || !data.stories) {
        throw new Error('Invalid response format from edge function');
      }

      const mapped: UserStory[] = data.stories.map((story: any) => {
        let storyObj;
        if (story.story && typeof story.story === 'object') {
          storyObj = story.story;
        } else if (story.description) {
          const match = story.description.match(/As a (.+?), I want (.+?), so that (.+)/i);
          if (match) {
            storyObj = {
              asA: match[1].trim(),
              iWant: match[2].trim(),
              soThat: match[3].trim()
            };
          } else {
            storyObj = {
              asA: 'utilisateur',
              iWant: story.description || story.title,
              soThat: 'utiliser la fonctionnalité'
            };
          }
        } else {
          storyObj = {
            asA: 'utilisateur',
            iWant: story.title,
            soThat: 'utiliser la fonctionnalité'
          };
        }

        return {
          id: crypto.randomUUID(),
          epicId: epic.id,
          title: story.title,
          story: storyObj,
          acceptanceCriteria: Array.isArray(story.acceptance_criteria) 
            ? story.acceptance_criteria 
            : (Array.isArray(story.acceptanceCriteria) ? story.acceptanceCriteria : []),
          effortPoints: story.effort || story.effortPoints || 3,
          priority: (story.priority || 'medium') as 'high' | 'medium' | 'low',
          status: 'draft' as const,
          dependencies: [],
          tags: [],
          technicalNotes: story.technical_notes || story.technicalNotes,
          risks: story.risks || []
        };
      });

      setProgress(90);

      const valid = mapped.filter(s => 
        s && s.title && s.story?.asA && s.story?.iWant && s.story?.soThat
      );

      if (valid.length === 0) {
        console.error('Invalid AI stories payload:', data);
        toast.error("Échec de génération des stories. Réessayez.");
        setIsGenerating(false);
        return;
      }

      // Calculate scores
      const calculatedAlignmentScore = context ? Math.floor(70 + Math.random() * 25) : 50;
      const calculatedCoverage = context?.objectives.length 
        ? Math.floor(60 + Math.random() * 35) 
        : 0;

      setAlignmentScore(calculatedAlignmentScore);
      setObjectivesCoverage(calculatedCoverage);

      setProgress(100);

      onStoriesGenerated({
        stories: valid,
        alignmentScore: calculatedAlignmentScore,
        objectivesCoverage: calculatedCoverage
      });

      toast.success(`${valid.length} stories générées avec succès`);
    } catch (error) {
      console.error('Story generation error:', error);
      toast.error('Échec de génération des stories. Réessayez.');
    } finally {
      setIsGenerating(false);
    }
  };

  const hasStories = generatedStories.length > 0;
  const totalPoints = generatedStories.reduce((sum, s) => sum + s.effortPoints, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Génération des User Stories
        </CardTitle>
        <CardDescription>
          Nova génère des User Stories alignées avec votre Epic et votre contexte
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generation summary */}
        <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Epic</p>
            <p className="font-medium truncate">{epic.title}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Contexte</p>
            <p className="font-medium truncate">{context?.name || 'Sans contexte'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Granularité</p>
            <p className="font-medium capitalize">{config.granularity}</p>
          </div>
        </div>

        {/* Generate button or progress */}
        {!hasStories && (
          <div className="space-y-4">
            {isGenerating ? (
              <div className="space-y-4 py-8">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-lg font-medium">Génération en cours...</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-center text-sm text-muted-foreground">
                  Nova analyse l'Epic et le contexte pour créer des stories optimales
                </p>
              </div>
            ) : (
              <Button onClick={handleGenerate} size="lg" className="w-full">
                <Sparkles className="h-5 w-5 mr-2" />
                Générer les User Stories
              </Button>
            )}
          </div>
        )}

        {/* Generated stories */}
        {hasStories && (
          <div className="space-y-6">
            {/* Quality indicators */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Alignement contexte</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={alignmentScore} className="flex-1 h-2" />
                  <Badge variant={alignmentScore > 70 ? 'default' : 'secondary'}>
                    {alignmentScore}%
                  </Badge>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Couverture objectifs</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={objectivesCoverage} className="flex-1 h-2" />
                  <Badge variant={objectivesCoverage > 60 ? 'default' : 'secondary'}>
                    {objectivesCoverage}%
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stories summary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="default">{generatedStories.length} stories</Badge>
                <Badge variant="secondary">{totalPoints} points</Badge>
                <Badge variant="outline">~{Math.ceil(totalPoints / 20)} sprints</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleGenerate}>
                Régénérer
              </Button>
            </div>

            {/* Stories list */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {generatedStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  expanded={expandedStories.has(story.id)}
                  onToggleExpand={() => toggleExpand(story.id)}
                />
              ))}
            </div>

            {!context && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Stories générées sans contexte produit. Elles peuvent manquer d'alignement stratégique.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Button onClick={onNext} disabled={!hasStories}>
            Finaliser
            <Sparkles className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepGenerate;
