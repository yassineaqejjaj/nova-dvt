import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

interface StoryGenerationModalProps {
  epic: Epic;
  open: boolean;
  onClose: () => void;
  onGenerate: (stories: UserStory[]) => void;
}

const StoryGenerationModal = ({ epic, open, onClose, onGenerate }: StoryGenerationModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyCount, setStoryCount] = useState<string>('auto');
  const [maxComplexity, setMaxComplexity] = useState<string>('8');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [focusInput, setFocusInput] = useState('');

  const handleAddFocus = () => {
    if (focusInput.trim() && !focusAreas.includes(focusInput.trim())) {
      setFocusAreas([...focusAreas, focusInput.trim()]);
      setFocusInput('');
    }
  };

  const handleRemoveFocus = (area: string) => {
    setFocusAreas(focusAreas.filter(a => a !== area));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-user-stories', {
        body: {
          epic: {
            title: epic.title,
            description: epic.description,
            context: epic.context
          },
          options: {
            storyCount: storyCount === 'auto' ? undefined : parseInt(storyCount),
            maxComplexity: parseInt(maxComplexity),
            focusAreas: focusAreas.length > 0 ? focusAreas : undefined
          }
        }
      });

      if (error) throw error;

      const stories: UserStory[] = data.stories.map((story: any) => ({
        ...story,
        id: crypto.randomUUID(),
        epicId: epic.id,
        status: 'draft' as const,
        dependencies: [],
        tags: []
      }));

      onGenerate(stories);
      toast.success(`Generated ${stories.length} user stories`);
    } catch (error) {
      console.error('Story generation error:', error);
      toast.error('Failed to generate stories. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate User Stories</DialogTitle>
          <DialogDescription>
            Configure how AI should break down your Epic into User Stories
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block text-muted-foreground">Epic Title</label>
            <p className="text-sm font-semibold">{epic.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Story Count</label>
              <Select value={storyCount} onValueChange={setStoryCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (3-7)</SelectItem>
                  <SelectItem value="3">Exactly 3</SelectItem>
                  <SelectItem value="5">Exactly 5</SelectItem>
                  <SelectItem value="7">Exactly 7</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Max Complexity</label>
              <Select value={maxComplexity} onValueChange={setMaxComplexity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 points</SelectItem>
                  <SelectItem value="8">8 points</SelectItem>
                  <SelectItem value="13">13 points</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Focus Areas (Optional)</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="e.g., Security, Performance, UX..."
                value={focusInput}
                onChange={(e) => setFocusInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFocus()}
              />
              <Button type="button" variant="outline" onClick={handleAddFocus}>
                Add
              </Button>
            </div>
            {focusAreas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {focusAreas.map(area => (
                  <Badge key={area} variant="secondary" className="gap-1">
                    {area}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveFocus(area)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Stories...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Stories
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StoryGenerationModal;
