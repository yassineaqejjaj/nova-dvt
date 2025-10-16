import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
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
      toast.error('Please provide Epic title and description');
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

  const handleSaveStories = (stories: UserStory[]) => {
    setSavedStories(stories);
    setShowReviewModal(false);
    toast.success(`${stories.length} stories saved successfully`);
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-foreground">Epic to User Stories</h1>
        <p className="text-muted-foreground">Transform high-level Epics into actionable User Stories with AI</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Define Your Epic</CardTitle>
          <CardDescription>Provide the Epic details to generate User Stories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Epic Title *</label>
            <Input
              placeholder="e.g., User Authentication System"
              value={epicTitle}
              onChange={(e) => setEpicTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Epic Description *</label>
            <Textarea
              placeholder="Describe the Epic in detail: goals, scope, user needs..."
              value={epicDescription}
              onChange={(e) => setEpicDescription(e.target.value)}
              rows={6}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Additional Context (Optional)</label>
            <Textarea
              placeholder="Technical constraints, dependencies, target users..."
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
            Generate User Stories from Epic
          </Button>
        </CardContent>
      </Card>

      {savedStories.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>User Stories ({savedStories.length})</CardTitle>
                <CardDescription>Generated stories from your Epic</CardDescription>
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
            {savedStories.map(story => (
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
                Add Story Manually
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGenerateClick}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate All
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
