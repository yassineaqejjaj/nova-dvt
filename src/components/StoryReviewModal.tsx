import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, RefreshCw, Save } from 'lucide-react';
import StoryCard from './StoryCard';
import { toast } from 'sonner';

interface Epic {
  id: string;
  title: string;
  description: string;
  context?: string;
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

interface StoryReviewModalProps {
  epic: Epic;
  generatedStories: UserStory[];
  open: boolean;
  onClose: () => void;
  onSave: (stories: UserStory[]) => void;
}

const StoryReviewModal = ({ epic, generatedStories, open, onClose, onSave }: StoryReviewModalProps) => {
  const [stories, setStories] = useState<UserStory[]>(generatedStories);
  const [includedStories, setIncludedStories] = useState<Set<string>>(
    new Set(generatedStories.map(s => s.id))
  );
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());

  // Sync when new stories arrive or modal toggles open
  useEffect(() => {
    setStories(generatedStories);
    setIncludedStories(new Set(generatedStories.map(s => s.id)));
  }, [generatedStories, open]);

  const toggleInclude = (storyId: string, included: boolean) => {
    setIncludedStories(prev => {
      const next = new Set(prev);
      if (included) {
        next.add(storyId);
      } else {
        next.delete(storyId);
      }
      return next;
    });
  };

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

  const removeStory = (storyId: string) => {
    setStories(stories.filter(s => s.id !== storyId));
    setIncludedStories(prev => {
      const next = new Set(prev);
      next.delete(storyId);
      return next;
    });
    toast.success('Story supprimée');
  };

  const handleSave = () => {
    const storiesToSave = stories.filter(s => includedStories.has(s.id));
    if (storiesToSave.length === 0) {
      toast.error('Veuillez sélectionner au moins une story à enregistrer');
      return;
    }
    onSave(storiesToSave);
  };

  const totalPoints = stories
    .filter(s => includedStories.has(s.id))
    .reduce((sum, s) => sum + s.effortPoints, 0);
  const estimatedSprints = Math.ceil(totalPoints / 20);
  const includedCount = includedStories.size;

  const descCoverage = stories.length
    ? (stories.filter(s => s.story.asA && s.story.iWant && s.story.soThat).length / stories.length) * 100
    : 0;
  const acCoverage = stories.length
    ? (stories.filter(s => s.acceptanceCriteria.length >= 2).length / stories.length) * 100
    : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Revoir les User Stories générées</DialogTitle>
          <DialogDescription>
            Relisez et modifiez les User Stories générées avant enregistrement
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 py-2 border-b">
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {includedCount} stories
          </Badge>
          <Badge variant="secondary">
            {totalPoints} pts
          </Badge>
          <Badge variant="outline">
            ~{estimatedSprints} sprints
          </Badge>
          <Badge variant="secondary">
            {Math.round(descCoverage)}% Desc
          </Badge>
          <Badge variant="secondary">
            {Math.round(acCoverage)}% AC
          </Badge>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 py-4">
          {stories.map(story => (
            <StoryCard
              key={story.id}
              story={story}
              expanded={expandedStories.has(story.id)}
              onToggleExpand={() => toggleExpand(story.id)}
              onToggleInclude={(included) => toggleInclude(story.id, included)}
              onRemove={() => removeStory(story.id)}
              showCheckbox
              isIncluded={includedStories.has(story.id)}
            />
          ))}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Régénérer
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer {includedCount} {includedCount === 1 ? 'story' : 'stories'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StoryReviewModal;
