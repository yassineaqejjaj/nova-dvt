import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import StoryGenerationModal from './StoryGenerationModal';
import StoryReviewModal from './StoryReviewModal';
import StoryCard from './StoryCard';

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

interface Epic {
  id: string;
  title: string;
  description: string;
  context?: string;
}

const EpicToUserStories = () => {
  const [epicTitle, setEpicTitle] = useState('');
  const [epicDescription, setEpicDescription] = useState('');
  const [epicContext, setEpicContext] = useState('');
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [generatedStories, setGeneratedStories] = useState<UserStory[]>([]);
  const [savedStories, setSavedStories] = useState<UserStory[]>([]);
  const [currentEpic, setCurrentEpic] = useState<Epic | null>(null);
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());

  const handleGenerateClick = () => {
    if (!epicTitle.trim() || !epicDescription.trim()) {
      toast.error('Merci de renseigner le titre et la description de l’Epic');
      return;
    }

    const epic: Epic = {
      id: crypto.randomUUID(),
      title: epicTitle,
      description: epicDescription,
      context: epicContext
    };

    setCurrentEpic(epic);
    setShowGenerationModal(true);
  };

  const handleGenerate = (stories: UserStory[]) => {
    setGeneratedStories(stories);
    setShowGenerationModal(false);
    setShowReviewModal(true);
  };

  const handleSaveStories = async (stories: UserStory[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Save stories to artifacts
      const { error: artifactError } = await supabase
        .from('artifacts')
        .insert([{
          user_id: user.id,
          artifact_type: 'canvas' as const,
          title: currentEpic?.title || 'User Stories',
          content: {
            type: 'user_stories',
            epic: currentEpic,
            stories: stories
          } as any
        }]);

      if (artifactError) throw artifactError;

      setSavedStories(stories);
      setShowReviewModal(false);
      toast.success(`${stories.length} stories enregistrées avec succès dans les artefacts`);
    } catch (error: any) {
      console.error('Erreur de sauvegarde:', error);
      toast.error('Échec de sauvegarde des stories');
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

  const totalPoints = savedStories.reduce((sum, story) => sum + story.effortPoints, 0);
  const estimatedSprints = Math.ceil(totalPoints / 20);
  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  const sortedStories = savedStories.slice().sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-foreground">Epic vers User Stories</h1>
        <p className="text-muted-foreground">Transformez vos Epics en User Stories actionnables avec l’IA</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Définir votre Epic</CardTitle>
          <CardDescription>Renseignez les détails pour générer des User Stories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Titre de l’Epic *</label>
            <Input
              placeholder="ex.: Système d’authentification"
              value={epicTitle}
              onChange={(e) => setEpicTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description de l’Epic *</label>
            <Textarea
              placeholder="Décrivez l’Epic en détail : objectifs, périmètre, besoins utilisateurs..."
              value={epicDescription}
              onChange={(e) => setEpicDescription(e.target.value)}
              rows={6}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Contexte additionnel (optionnel)</label>
            <Textarea
              placeholder="Contraintes techniques, dépendances, utilisateurs cibles..."
              value={epicContext}
              onChange={(e) => setEpicContext(e.target.value)}
              rows={4}
            />
          </div>

          <Button 
            onClick={handleGenerateClick}
            className="w-full"
            size="lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Générer des User Stories à partir de l’Epic
          </Button>
        </CardContent>
      </Card>

      {savedStories.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>User Stories ({savedStories.length})</CardTitle>
                <CardDescription>Stories générées à partir de votre Epic</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {totalPoints} points
                </Badge>
                <Badge variant="outline">
                  ~{estimatedSprints} sprints
                </Badge>
              </div>
            </div>
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

            <div className="flex gap-2 pt-4">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une story manuellement
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGenerateClick}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regénérer tout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentEpic && (
        <>
          <StoryGenerationModal
            epic={currentEpic}
            open={showGenerationModal}
            onClose={() => setShowGenerationModal(false)}
            onGenerate={handleGenerate}
          />

          <StoryReviewModal
            epic={currentEpic}
            generatedStories={generatedStories}
            open={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            onSave={handleSaveStories}
          />
        </>
      )}
    </div>
  );
};

export default EpicToUserStories;
